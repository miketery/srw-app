import React, { useEffect, useState } from 'react'
import { Text, View, Pressable } from 'react-native'

import secrets from '../../lib/secretsGrempe';

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import Vault from '../../models/Vault'
import Contact from '../../models/Contact'
import RecoverSplitsManager from '../../managers/RecoverSplitsManager'
import getVaultsAndManagers from '../../testdata/genData'

import { useSessionContext } from '../../contexts/SessionContext'
import RecoverSplit, { RecoverSplitState } from '../../models/RecoverSplit'
import { bytesToHex } from '../../lib/utils'

import SS, { StoredType } from '../../services/StorageService'

import ContactsManager from '../../managers/ContactsManager'
import GuardiansManager from '../../managers/GuardiansManager'
import { InboundMessageDict, Message } from '../../models/Message'
import { GoBackButton, LoadingScreen } from '../../components'
import MainContainer from '../../components/MainContainer';
import { RecoverSplitStateText } from '../RecoverSplits/RecoverSplitViewScreen';

/**
 * Test Recover Split Flow
 */ 

const deleteAllRecoveryRelated = () => {
    const types = [StoredType.recoverSplit, StoredType.guardian]
    for(let type of types)
        SS.deleteAllByType(type)
}

async function RecoverPlanCreate(
        vaultsAndManagers: {
            [name: string]: {
                vault: Vault,
                contactsManager: ContactsManager,
                contacts: {[nameOrPk: string]: Contact}
            }
        }) {
    console.log('[DevRecoverSplitScreen.RecoverPlanCreate] TEST')
    // alice creates recovery w/ Bob and Charlie and Dan
    const { alice } = vaultsAndManagers
    const recoverSplitManager = new RecoverSplitsManager(alice.vault, {}, alice.contactsManager)
    const recoverSplit = await recoverSplitManager.createRecoverSplit(
        'RP_01 - test', 'testing')
    recoverSplit.addRecoverSplitParty(alice.contacts['bob'], 1, true)
    recoverSplit.addRecoverSplitParty(alice.contacts['charlie'], 1, false)
    recoverSplit.addRecoverSplitParty(alice.contacts['dan'], 2, true)

    const byteSecret = new TextEncoder().encode(JSON.stringify({secret: 'MY SECRET'}))
    recoverSplit.setPayload(byteSecret)
    recoverSplit.setThreshold(3)
    console.assert(recoverSplit.checkValidPreSubmit())
    
    await recoverSplit.generateKey()
    await recoverSplit.splitKey()
 
    console.log(recoverSplit.toDict())
    console.log(recoverSplit.recoverSplitPartys[0].toDict())
    const keyHex = bytesToHex(recoverSplit.key)
    console.log(keyHex)

    const allShares = []
    for(let i = 0; i < recoverSplit.recoverSplitPartys.length; i++) {
        for(let j = 0; j < recoverSplit.recoverSplitPartys[i].shares.length; j++) {
            allShares.push(recoverSplit.recoverSplitPartys[i].shares[j])
        }
    }
    // only 2 shares
    const testNoWork = secrets.combine(allShares.slice(0, 2))
    console.assert(testNoWork !== keyHex)
    // 3 shares
    const willWork = secrets.combine(allShares.slice(0, 3))
    console.assert(willWork === keyHex)
    console.log('combine test complete')
    //TODO
}
async function RecoverPlanFullFlow(
        vaultsAndManagers: {
            [name: string]: {
                vault: Vault,
                contactsManager: ContactsManager,
                contacts: {[nameOrPk: string]: Contact},
            }
        }): Promise<void> {
    deleteAllRecoveryRelated()
    const { alice, bob, charlie, dan } = vaultsAndManagers
    const recoverSplitManager = new RecoverSplitsManager(alice.vault, {}, alice.contactsManager)
    const recoverSplit: RecoverSplit = await recoverSplitManager.createRecoverSplit(
        'RP_01 - test', 'RP Dev Test')
    recoverSplit.addRecoverSplitParty(alice.contacts['bob'], 1, true)
    recoverSplit.addRecoverSplitParty(alice.contacts['charlie'], 1, false)
    recoverSplit.addRecoverSplitParty(alice.contacts['dan'], 2, true)
    console.log('Parties added:', recoverSplit.toDict())

    const byteSecret = new TextEncoder().encode(JSON.stringify({secret: 'MY SECRET'}))
    recoverSplit.setPayload(byteSecret)
    recoverSplit.setThreshold(3)
    console.assert(recoverSplit.checkValidPreSubmit())
    recoverSplit.fsm.send('SPLIT_KEY')
    await new Promise(r => setTimeout(r, 300))
    console.log(recoverSplit.toDict())
    console.assert(RecoverSplitState.READY_TO_SEND_INVITES === recoverSplit.state)
    recoverSplit.fsm.send('SEND_INVITES') 
    // ^^^ will be in SENDING_INVITES state until all sent, then in WAITING_ON_PARTICIPANTS
    await new Promise(r => setTimeout(r, 300))
    console.log('STATE', recoverSplit.state, recoverSplit.allInvitesSent())
    console.log('BEFORE ACCEPTS', recoverSplit.toDict())
    // user fetch request and send accept
    const getRequestAndAccept = async (user, accept, originUser, originRecoverSplitManager: RecoverSplitsManager) => {
        const name = user.vault.name
        const request = (await user.vault.fetchMessages())[0] as InboundMessageDict
        const guardianManager = new GuardiansManager(user.vault, {}, user.contactsManager)
        await new Promise(r => setTimeout(r, 300))
        guardianManager.processGuardianRequest(Message.inbound(request, user.vault))
        await new Promise(r => setTimeout(r, 300))
        const guardian = Object.values(guardianManager.getGuardians())[0]
        const response = accept ? 'accepted' : 'declined'
        guardianManager.acceptGuardian(guardian.pk, () => console.log(name, response, guardian.toDict()))
        const msgForRecoverSplit = (await originUser.vault.fetchMessages())[0] as InboundMessageDict
        originRecoverSplitManager.processRecoverSplitResponse(Message.inbound(msgForRecoverSplit, originUser.vault))
    }
    await getRequestAndAccept(bob, true, alice, recoverSplitManager)
    await getRequestAndAccept(charlie, true, alice, recoverSplitManager)
    await getRequestAndAccept(dan, true, alice, recoverSplitManager) // change true to false to see decline
    await new Promise(r => setTimeout(r, 500))

    console.log('AFTER ACCEPTS', recoverSplit.toDict())
    recoverSplit.recoverSplitPartys.forEach((rp) => console.log(rp.name, rp.state))
    // recoverSplit.finalize()
    console.log(recoverSplit.state)
    return
}

const testShamir = () => {
    const secret = 'MY SECRET'
    const secretBytes = new TextEncoder().encode(secret)
    const secretHex = bytesToHex(secretBytes)
    console.log(secretHex)
    const shares1 = secrets.share(secretHex, 3, 2)
    const shares2 = secrets.share(secretHex, 3, 2)
    shares1.forEach( (s) => console.log('A', s))
    shares2.forEach( (s) => console.log('B', s))

    const a = secrets.combine([shares1[0], shares1[1]])
    console.log(a)
    const b = secrets.combine([shares2[0], shares2[1]])
    console.log(b)
}

const test = async (vaultsAndManagers) => {
    const { alice, bob, charlie, dan } = vaultsAndManagers
    const cm = alice.contactsManager
    const recoverSplitManager = new RecoverSplitsManager(alice.vault, {}, cm)
    const abc = await recoverSplitManager.createRecoverSplit('RP_01 - test', 'RP Dev Test')
    await new Promise(r => setTimeout(r, 300))
    console.log(cm.getContact('c__dan'))
    // FAILRS
    console.log(abc.getContact('c__dan'))
}   

type DevRecoverSplitScreenProps = {
    route: {
        name: string
    },
    navigation: any
}

const DevRecoverSplitScreen: React.FC<DevRecoverSplitScreenProps> = (props) => {
    const {manager} = useSessionContext()

    const [loading, setLoading] = useState(true)
    const [vaultsAndManagers, setVaultsAndManagers] = useState<{
        [name: string]: {
            vault: Vault,
            contactsManager: ContactsManager,
            contacts: {[name: string]: Contact},
        }
    }>({})

    useEffect(() => {
        async function loadVaultsAndContacts() {
            const vaultsAndManagers = await getVaultsAndManagers()
            setVaultsAndManagers(vaultsAndManagers)
            setLoading(false)
        }
        loadVaultsAndContacts()
    }, [])
    const current_route = props.route.name
    const header = 'Dev Recovery Plans'
    const buttonRow = <GoBackButton onPressOut={() => props.navigation.goBack()} />
    return loading ? <LoadingScreen />: <MainContainer header={header} buttonRow={buttonRow}>
        <View>
            <Text style={ds.text}>Route: {current_route}</Text>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => RecoverPlanCreate(vaultsAndManagers)}>
                <Text style={ds.buttonText}>Recovery Plan Basic</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => RecoverPlanFullFlow(vaultsAndManagers)}>
                <Text style={ds.buttonText}>Recovery Full Flow</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => testShamir()}>
                <Text style={ds.buttonText}>test</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.redButton, tw`mt-4 w-full`]}
                    onPress={() => test(vaultsAndManagers)}>
                <Text style={ds.buttonText}>Test</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.redButton, tw`mt-4 w-full`]}
                    onPress={() => deleteAllRecoveryRelated()}>
                <Text style={ds.buttonText}>Delete</Text>
            </Pressable>
        </View>
        <View style={tw`flex flex-col items-start`}>
            
            <Text style={ds.text}>{RecoverSplitState.START}</Text>
            {RecoverSplitStateText(RecoverSplitState.START)}
            
            <Text style={ds.text}>{RecoverSplitState.SPLITTING_KEY}</Text>
            {RecoverSplitStateText(RecoverSplitState.SPLITTING_KEY)}

            <Text style={ds.text}>{RecoverSplitState.READY_TO_SEND_INVITES}</Text>
            {RecoverSplitStateText(RecoverSplitState.READY_TO_SEND_INVITES)}

            <Text style={ds.text}>{RecoverSplitState.SENDING_INVITES}</Text>
            {RecoverSplitStateText(RecoverSplitState.SENDING_INVITES)}

            <Text style={ds.text}>{RecoverSplitState.WAITING_ON_PARTICIPANTS}</Text>
            {RecoverSplitStateText(RecoverSplitState.WAITING_ON_PARTICIPANTS)}

            <Text style={ds.text}>{RecoverSplitState.READY}</Text>
            {RecoverSplitStateText(RecoverSplitState.READY)}

            <Text style={ds.text}>{RecoverSplitState.FINAL}</Text>
            {RecoverSplitStateText(RecoverSplitState.FINAL)}

            <Text style={ds.text}>{RecoverSplitState.ARCHIVED}</Text>
            {RecoverSplitStateText(RecoverSplitState.ARCHIVED)}
        </View>
    </MainContainer>
}
export default DevRecoverSplitScreen;
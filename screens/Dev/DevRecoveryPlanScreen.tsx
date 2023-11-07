import React, { useEffect, useState } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'

// import secrets from 'secrets.js-grempe'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import Vault from '../../models/Vault'
import Contact from '../../models/Contact'
import RecoveryPlansManager from '../../managers/RecoveryPlansManager'
import getVaultsAndManagers from '../../testdata/testContacts'

// import DAS from '../../services/DigitalAgentService'

// import Vault from '../../models/Vault'
// import RecoveryPlan from '../../models/RecoveryPlan'
// import { Message } from '../../models/Message'
// import InboundMessageManager from '../../managers/MessagesManager'

import { useSessionContext } from '../../contexts/SessionContext'
import RecoveryPlan, { PayloadType, RecoveryPlanState } from '../../models/RecoveryPlan'
import { bytesToHex, hexToBytes } from '../../lib/utils'

import SS, { StoredType } from '../../services/StorageService'

import DigitalAgentService, { GetMessagesFunction, SenderFunction } from '../../services/DigitalAgentService'
import ContactsManager from '../../managers/ContactsManager'
import GuardiansManager from '../../managers/GuardiansManager'
import { InboundMessageDict, Message } from '../../models/Message'
import { GoBackButton } from '../../components'

/**
 * Test Recovery Plan Flow Messages
 */ 

const deleteAllRecoveryRelated = () => {
    const types = [StoredType.recoveryPlan, StoredType.guardian]
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
    console.log('[DevRecoveryPlanScreen.RecoverPlanCreate] TEST')
    // alice creates recovery w/ Bob and Charlie and Dan
    const { alice } = vaultsAndManagers
    const recoveryPlanManager = new RecoveryPlansManager(alice.vault, {}, alice.contactsManager)
    const recoveryPlan = recoveryPlanManager.createRecoveryPlan(
        'RP_01 - test', 'testing')
    recoveryPlan.addRecoveryParty(alice.contacts['bob'], 1, true)
    recoveryPlan.addRecoveryParty(alice.contacts['charlie'], 1, false)
    recoveryPlan.addRecoveryParty(alice.contacts['dan'], 2, true)

    const byteSecret = new TextEncoder().encode('MY SECRET')
    recoveryPlan.setPayload(byteSecret, PayloadType.OBJECT)
    recoveryPlan.setThreshold(3)
    console.assert(recoveryPlan.checkValidPreSubmit())
    
    await recoveryPlan.generateKey()
    await recoveryPlan.splitKey()
 
    console.log(recoveryPlan.toDict())
    console.log(recoveryPlan.recoveryPartys[0].toDict())
    const keyHex = bytesToHex(recoveryPlan.key)
    console.log(keyHex)

    const allShares = []
    for(let i = 0; i < recoveryPlan.recoveryPartys.length; i++) {
        for(let j = 0; j < recoveryPlan.recoveryPartys[i].shares.length; j++) {
            allShares.push(recoveryPlan.recoveryPartys[i].shares[j])
        }
    }
    // only 2 shares
    // const testNoWork = secrets.combine(allShares.slice(0, 2))
    // console.assert(testNoWork !== keyHex)
    // // 3 shares
    // const willWork = secrets.combine(allShares.slice(0, 3))
    // console.assert(willWork === keyHex)
    // console.log('combine test complete')
    //TODO
}
async function RecoverPlanFullFlow(
        vaultsAndManagers: {
            [name: string]: {
                vault: Vault,
                contactsManager: ContactsManager,
                contacts: {[nameOrPk: string]: Contact},
                getMessages: GetMessagesFunction,
                sender: SenderFunction,
            }
        }): Promise<void> {
    deleteAllRecoveryRelated()
    const { alice, bob, charlie, dan } = vaultsAndManagers
    const recoveryPlanManager = new RecoveryPlansManager(alice.vault, {}, alice.contactsManager)
    const recoveryPlan: RecoveryPlan = recoveryPlanManager.createRecoveryPlan(
        'RP_01 - test', 'RP Dev Test')
    recoveryPlan.addRecoveryParty(alice.contacts['bob'], 1, true)
    recoveryPlan.addRecoveryParty(alice.contacts['charlie'], 1, false)
    recoveryPlan.addRecoveryParty(alice.contacts['dan'], 2, true)
    console.log('Parties added:', recoveryPlan.toDict())

    const byteSecret = new TextEncoder().encode('MY SECRET')
    recoveryPlan.setPayload(byteSecret, PayloadType.OBJECT)
    recoveryPlan.setThreshold(3)
    console.assert(recoveryPlan.checkValidPreSubmit())
    recoveryPlan.fsm.send('SPLIT_KEY')
    await new Promise(r => setTimeout(r, 300))
    console.log(recoveryPlan.toDict())
    console.assert(RecoveryPlanState.READY_TO_SEND_INVITES === recoveryPlan.state)
    recoveryPlan.fsm.send('SEND_INVITES') 
    // ^^^ will be in SENDING_INVITES state until all sent, then in WAITING_ON_PARTICIPANTS
    await new Promise(r => setTimeout(r, 300))
    console.log('STATE', recoveryPlan.state, recoveryPlan.allPartysSent())
    console.log('BEFORE ACCEPTS', recoveryPlan.toDict())
    // user fetch request and send accept
    const getRequestAndAccept = async (user, accept, originUser, originRecoveryPlanManager: RecoveryPlansManager) => {
        const name = user.vault.name
        const request = (await user.getMessages())[0] as InboundMessageDict
        const guardianManager = new GuardiansManager(user.vault, {},
            user.contactsManager, DigitalAgentService.getSendMessageFunction(user.vault))
        await new Promise(r => setTimeout(r, 300))
        guardianManager.processGuardianRequest(Message.inbound(request))
        await new Promise(r => setTimeout(r, 300))
        const guardian = Object.values(guardianManager.getGuardians())[0]
        if(accept)
            guardianManager.acceptGuardian(guardian, () => console.log(name, 'accepted', guardian.toDict()))
        else
            guardianManager.declineGuardian(guardian, () => console.log(name, 'declined', guardian.toDict()))
        const msgForRecoveryPlan = (await originUser.getMessages())[0] as InboundMessageDict
        originRecoveryPlanManager.processRecoveryPlanResponse(Message.inbound(msgForRecoveryPlan))
    }
    await getRequestAndAccept(bob, true, alice, recoveryPlanManager)
    await getRequestAndAccept(charlie, true, alice, recoveryPlanManager)
    await getRequestAndAccept(dan, true, alice, recoveryPlanManager) // change true to false to see decline
    await new Promise(r => setTimeout(r, 500))

    console.log('AFTER ACCEPTS', recoveryPlan.toDict())
    recoveryPlan.recoveryPartys.forEach((rp) => console.log(rp.name, rp.state))
    // recoveryPlan.finalize()
    console.log(recoveryPlan.state)
    return
}

const testShamir = () => {
    const secret = 'MY SECRET'
    const secretBytes = new TextEncoder().encode(secret)
    const secretHex = bytesToHex(secretBytes)
    console.log(secretHex)
    // const shares1 = secrets.share(secretHex, 3, 2)
    // const shares2 = secrets.share(secretHex, 3, 2)
    // shares1.forEach( (s) => console.log('A', s))
    // shares2.forEach( (s) => console.log('B', s))
}

type DevRecoveryPlanScreenProps = {
    route: {
        name: string
    },
    navigation: any
}

const DevRecoveryPlanScreen: React.FC<DevRecoveryPlanScreenProps> = (props) => {
    const {manager} = useSessionContext()

    const [loading, setLoading] = useState(true)
    const [vaultsAndManagers, setVaultsAndManagers] = useState<{
        [name: string]: {
            vault: Vault,
            contactsManager: ContactsManager,
            contacts: {[name: string]: Contact},
            getMessages: GetMessagesFunction,
            sender: SenderFunction,
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
    return loading ? <View style={ds.mainContainerPtGradient}>
            <Text>Loading...</Text>
        </View>: <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Dev Recovery Plans</Text>
            </View>
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
                        onPress={() => deleteAllRecoveryRelated()}>
                    <Text style={ds.buttonText}>Delete</Text>
                </Pressable>
            </View>
        </ScrollView>
        <View style={ds.buttonRowB}>
            <GoBackButton onPressOut={() => props.navigation.goBack()} />
        </View>
    </View>
}
export default DevRecoveryPlanScreen;
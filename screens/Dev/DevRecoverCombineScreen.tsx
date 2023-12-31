import React, { useEffect, useState } from 'react'
import { Text, View, Pressable } from 'react-native'
import base58 from 'bs58'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import Vault from '../../models/Vault'
import Contact from '../../models/Contact'
import RecoverSplitsManager from '../../managers/RecoverSplitsManager'
import getVaultsAndManagers from '../../testdata/genData'
import RecoverVaultUtil from '../../managers/RecoverVaultUtil'

import RecoverSplit, { RecoverSplitState } from '../../models/RecoverSplit'
import RecoverCombine, { CombineParty } from '../../models/RecoverCombine'

import SS, { StoredType } from '../../services/StorageService'

import ContactsManager from '../../managers/ContactsManager'
import GuardiansManager from '../../managers/GuardiansManager'
import { InboundMessageDict, Message } from '../../models/Message'
import { GoBackButton, LoadingScreen } from '../../components'
import MainContainer from '../../components/MainContainer'

/**
 * Test Recover Combine
 */ 

const deleteAllRecoveryRelated = () => {
    const types = [StoredType.recoverSplit, StoredType.guardian, StoredType.recoverCombine]
    for(let type of types)
        SS.deleteAllByType(type)
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
        const request = (await user.vault.getMessages())[0] as InboundMessageDict
        const guardianManager = new GuardiansManager(user.vault, {}, user.contactsManager)
        await new Promise(r => setTimeout(r, 300))
        guardianManager.processGuardianRequest(Message.inbound(request, user.vault))
        await new Promise(r => setTimeout(r, 300))
        const guardian = Object.values(guardianManager.getGuardians())[0]
        const response = accept ? 'accepted' : 'declined'
        guardianManager.acceptGuardian(guardian.pk, () => console.log(name, response, guardian.toDict()))
        const msgForRecoverSplit = (await originUser.vault.getMessages())[0] as InboundMessageDict
        originRecoverSplitManager.processRecoverSplitResponse(Message.inbound(msgForRecoverSplit, originUser.vault))
        return guardianManager
    }
    const bGM = await getRequestAndAccept(bob, true, alice, recoverSplitManager)
    const cGM = await getRequestAndAccept(charlie, true, alice, recoverSplitManager)
    const dGM = await getRequestAndAccept(dan, true, alice, recoverSplitManager) // change true to false to see decline
    await new Promise(r => setTimeout(r, 500))

    console.log('AFTER ACCEPTS', recoverSplit.toDict())
    recoverSplit.recoverSplitPartys.forEach((rp) => console.log(rp.name, rp.state))
    // recoverSplit.finalize()
    console.log(recoverSplit.state)

    console.log(recoverSplit.getManifest())
    // NOW LETS DO RECOVER COMBINE
    // const recoverCombine = RecoverCombine.create(alice.vault, recoverSplit)
    return
}
async function recoverCombineFlow(
        vaultsAndManagers: {
            [name: string]: {
                vault: Vault,
                contactsManager: ContactsManager,
                contacts: {[nameOrPk: string]: Contact},
            }
        }): Promise<void> {
    //
    const { alice, bob, charlie, dan } = vaultsAndManagers
    const partys = [bob, charlie, dan]
    let promises = []
    const guardiansManagers = partys.map((user) => {
        const gm = new GuardiansManager(user.vault, {}, user.contactsManager)
        promises.push(gm.loadGuardians())
        user['guardiansManager'] = gm
        return gm
    })
    await Promise.all(promises)
    console.log(guardiansManagers[0].getGuardiansArray())
    const manifest = guardiansManagers[0].getGuardiansArray()[0].manifest
    console.log('MANIFEST', manifest)
    const { vault, recoverCombine } = await RecoverVaultUtil.init()
    recoverCombine.setManifest(manifest)
    const gerReqeustAndAccept = async (vault: Vault, guardiansManager: GuardiansManager, recoverCombine: RecoverCombine) => {
        const combineParty: CombineParty = recoverCombine.combinePartys.filter((cp) => cp.did === vault.did)[0]
        const request = combineParty.recoverCombineRequestMsg() as InboundMessageDict
        console.log(request)
        const {guardian, metadata} = await guardiansManager.processRecoverCombineRequest(Message.inbound(request, vault))
        console.log('GUARDIAN', guardian.toDict())
        console.log('METADATA', metadata)
        const response = guardian.recoverCombineResponseMsg('accept', {
            did: `did:arx:${base58.decode(metadata.verify_key)}`,
            verify_key: base58.decode(metadata.verify_key),
            public_key: base58.decode(metadata.public_key)}) as InboundMessageDict
        console.log('RESPONSE', response)
        recoverCombine.processRecoverCombineResponse(Message.inbound(response, recoverCombine.vault))
    }
    partys.map((user, i) => gerReqeustAndAccept(user.vault, guardiansManagers[i], recoverCombine))
    await new Promise(r => setTimeout(r, 300))
    console.log(recoverCombine.toDict())
    recoverCombine.combine()
}
async function recoverCombineFsmFlow(
        vaultsAndManagers: {
            [name: string]: {
                vault: Vault,
                contactsManager: ContactsManager,
                contacts: {[nameOrPk: string]: Contact},
            }
        }): Promise<void> {
    const { alice, bob, charlie, dan } = vaultsAndManagers
    const partys = [bob, charlie, dan]
    let promises = []
    const guardiansManagers = partys.map((user) => {
        const gm = new GuardiansManager(user.vault, {}, user.contactsManager)
        promises.push(gm.loadGuardians())
        user['guardiansManager'] = gm
        return gm
    })
    await Promise.all(promises)
    console.log(guardiansManagers[0].getGuardiansArray())
    const manifest = guardiansManagers[0].getGuardiansArray()[0].manifest
    const { vault, recoverCombine } = await RecoverVaultUtil.init()
    const mm = guardiansManagers[0].getGuardiansArray()[0].manifestMsg({
        did: `did:arx:${vault.b58_verify_key}`,
        verify_key: vault.verify_key,
        public_key: vault.public_key
    }) as InboundMessageDict
    RecoverVaultUtil.processManifest(vault, recoverCombine, Message.inbound(mm, vault))
    console.log(recoverCombine.manifest)
    console.log('MANIFEST', manifest)
    recoverCombine.fsm.send('LOAD_MANIFEST')
    await new Promise(r => setTimeout(r, 50))
    recoverCombine.fsm.send('SEND_REQUESTS')
    await new Promise(r => setTimeout(r, 500))
    const gerReqeustAndAccept = async (vault: Vault, guardiansManager: GuardiansManager, recoverCombine: RecoverCombine) => {
        const request = (await vault.getMessages())[0] as InboundMessageDict
        console.log(request)
        const {guardian, metadata} = await guardiansManager.processRecoverCombineRequest(Message.inbound(request, vault))
        console.log('GUARDIAN', guardian.toDict())
        console.log('METADATA', metadata)
        const response = guardian.recoverCombineResponseMsg('accept', {
            did: `did:arx:${metadata.verify_key}`,
            verify_key: base58.decode(metadata.verify_key),
            public_key: base58.decode(metadata.public_key)}) as InboundMessageDict
        vault.sender(response)
        console.log('RESPONSE', response)
    }
    partys.map((user, i) => gerReqeustAndAccept(user.vault, guardiansManagers[i], recoverCombine))
    await new Promise(r => setTimeout(r, 500))
    const responses = await recoverCombine.vault.getMessages()
    console.log(responses)
    for(let response of responses) {
        recoverCombine.processRecoverCombineResponse(Message.inbound(response as InboundMessageDict, recoverCombine.vault))
        await new Promise(r => setTimeout(r, 100))
    }
    await new Promise(r => setTimeout(r, 200))
    console.log(recoverCombine.toString())
    console.log(recoverCombine.toDict())

}

type DevRecoverCombineScreenProps = {
    route: {
        name: string
    },
    navigation: any
}

const DevRecoverCombineScreen: React.FC<DevRecoverCombineScreenProps> = (props) => {
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
    const header = 'Dev Recover Combine'
    const buttonRow = <>
        <GoBackButton onPressOut={() => props.navigation.goBack()} />
    </>
    return loading ? <LoadingScreen /> : <MainContainer header={header} buttonRow={buttonRow}>
        <View>
            <Text style={ds.text}>Route: {current_route}</Text>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => RecoverPlanFullFlow(vaultsAndManagers)}>
                <Text style={ds.buttonText}>Recovery Plan Create Split</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => recoverCombineFlow(vaultsAndManagers)}>
                <Text style={ds.buttonText}>Combine</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.greenButton, tw`mt-4 w-full`]}
                    onPress={() => recoverCombineFsmFlow(vaultsAndManagers)}>
                <Text style={ds.buttonText}>Combine with FSM</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.redButton, tw`mt-4 w-full`]}
                    onPress={() => deleteAllRecoveryRelated()}>
                <Text style={ds.buttonText}>Delete</Text>
            </Pressable>
        </View>
    </MainContainer>
}
export default DevRecoverCombineScreen;
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
import { PayloadType, RecoveryPartyState, RecoveryPlanState } from '../../models/RecoveryPlan'
import { bytesToHex, hexToBytes } from '../../lib/utils'

import SS, { StoredType } from '../../services/StorageService'

import DigitalAgentService from '../../services/DigitalAgentService'
import ContactsManager from '../../managers/ContactsManager'
import GuardiansManager from '../../managers/GuardiansManager'
import { InboundMessageDict, Message } from '../../models/Message'
import { GuardianState } from '../../models/Guardian'

/**
 * Test Recovery Plan Flow Messages
 */ 

const deleteAllRecoveryRelated = () => {
    const types = [StoredType.recoveryPlan, StoredType.guardian]
    for(let type of types)
        SS.deleteAllByType(type)

}

async function RecoverPlanCreate(
        vaults: {[pk: string]: Vault},
        contacts: {[name: string]: Contact}) {
    console.log('[DevRecoveryPlanScreen.RecoverPlanCreate] TEST')
    // alice creates recovery w/ Bob and Charlie and Dan
    const aliceVault = vaults['alice']
    const aliceContacts = contacts['alice']
    const aliceContactsManager = new ContactsManager(aliceVault, Object.fromEntries(
        Object.values(aliceContacts).map( (c) => [c.pk, c])))
    const recoveryPlanManager = new RecoveryPlansManager(aliceVault, {}, aliceContactsManager)
    const recoveryPlan = recoveryPlanManager.createRecoveryPlan(
        'RP_01 - test', 'testing')
    recoveryPlan.addRecoveryParty(aliceContacts['bob'], 1, true)
    recoveryPlan.addRecoveryParty(aliceContacts['charlie'], 1, false)
    recoveryPlan.addRecoveryParty(aliceContacts['dan'], 2, true)

    const byteSecret = new TextEncoder().encode('MY SECRET')
    recoveryPlan.setPayload(byteSecret, PayloadType.OBJECT)
    recoveryPlan.setThreshold(3)
    console.log('XXX')
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
                contacts: {[nameOrPk: string]: Contact}
            }
        }): Promise<void> {
    deleteAllRecoveryRelated()
    const alice = vaultsAndManagers['alice']
    const bob = vaultsAndManagers['bob']
    const charlie = vaultsAndManagers['charlie']
    const dan = vaultsAndManagers['dan']

    const recoveryPlanManager = new RecoveryPlansManager(alice.vault, {}, alice.contactsManager)
    const recoveryPlan = recoveryPlanManager.createRecoveryPlan(
        'RP_01 - test', 'RP Dev Test')
    recoveryPlan.addRecoveryParty(alice.contacts['bob'], 1, true)
    recoveryPlan.addRecoveryParty(alice.contacts['charlie'], 1, false)
    recoveryPlan.addRecoveryParty(alice.contacts['dan'], 2, true)
    console.log(recoveryPlan.toDict())
    console.log(alice.contacts)

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

    const guardianRequest = (await DigitalAgentService.getGetMessagesFunction(bob.vault)())[0] as InboundMessageDict
    const bobGuardiansManager = new GuardiansManager(bob.vault, {},
        bob.contactsManager, DigitalAgentService.getPostMessageFunction(bob.vault))
    await new Promise(r => setTimeout(r, 300))
    bobGuardiansManager.processGuardianRequest(Message.inbound(guardianRequest))
    
    await new Promise(r => setTimeout(r, 300))
    const guardianBobForAlice = Object.values(bobGuardiansManager.getGuardians())[0]
    bobGuardiansManager.acceptGuardian(guardianBobForAlice, () => console.log('XAXA'))
    await new Promise(r => setTimeout(r, 300))
    console.assert(guardianBobForAlice.state === GuardianState.ACCEPTED)
    
    const aliceGetMessages = DigitalAgentService.getGetMessagesFunction(alice.vault)
    const msgForAlice = (await aliceGetMessages())[0] as InboundMessageDict
    console.log('msgForAlice from Bob', msgForAlice)
    recoveryPlanManager.processRecoveryPlanResponse(Message.inbound(msgForAlice))
    await new Promise(r => setTimeout(r, 300))
    console.log('recoveryPlanManager', recoveryPlan.toDict())
    return
    // recoveryPlan.fsm.submit('SEND_INVITES')
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
    }
}

const DevRecoveryPlanScreen: React.FC<DevRecoveryPlanScreenProps> = (props) => {
    const {manager} = useSessionContext()

    const [loading, setLoading] = useState(true)
    const [vaultsAndManagers, setVaultsAndManagers] = useState<{
        [name: string]: {
            vault: Vault,
            contactsManager: ContactsManager,
            contacts: {[name: string]: Contact}
        }
    }>({})
    // const [contacts, setContacts] = useState<{string?: Contact}>({})

    useEffect(() => {
        async function loadVaultsAndContacts() {
            const vaultsAndManagers = await getVaultsAndManagers()
            setVaultsAndManagers(vaultsAndManagers)
            setLoading(false)
        }
        loadVaultsAndContacts()
    }, [])

    const current_route = props.route.name
    return <View style={ds.mainContainerPtGradient}>
    <ScrollView style={ds.scrollViewGradient}>
        <View style={ds.headerRow}>
            <Text style={ds.header}>Dev Recovery Plans</Text>
        </View>
        <View>
            <Text style={ds.text}>Route: {current_route}</Text>
        </View>
        {/* <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => RecoverPlanCreate(vaults, contacts)}>
                <Text style={ds.buttonText}>Recovery Plan Basic</Text>
            </Pressable>
        </View> */}
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
        {/* <View style={tw`justify-around mb-10 flex-col items-center`}>
            <Button text='Add Contact' onPress={
                () => props.navigation.navigate('ContactCreateRoute')} />
        </View> */}
    </View>
}
export default DevRecoveryPlanScreen;
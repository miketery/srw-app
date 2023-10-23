import React, { useEffect, useState } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'

import secrets from 'secrets.js-grempe'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import Vault from '../../models/Vault'
import Contact from '../../models/Contact'
import RecoveryPlansManager from '../../managers/RecoveryPlansManager'
import getTestVaultsAndContacts from '../../testdata/testContacts'

// import DAS from '../../services/DigitalAgentService'

// import Vault from '../../models/Vault'
// import RecoveryPlan from '../../models/RecoveryPlan'
// import { Message } from '../../models/Message'
// import InboundMessageManager from '../../managers/MessagesManager'

import { useSessionContext } from '../../contexts/SessionContext'
import { PayloadType, RecoveryPlanState } from '../../models/RecoveryPlan'
import { bytesToHex, hexToBytes } from '../../lib/utils'

import SS, { StoredType } from '../../services/StorageService'

import DigitalAgentService from '../../services/DigitalAgentService'
import ContactsManager from '../../managers/ContactsManager'
import GuardiansManager from '../../managers/GuardiansManager'
import { InboundMessageDict, Message } from '../../models/Message'

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
    const recoveryPlanManager = new RecoveryPlansManager(aliceVault, {}, aliceContactsManager.getContact)
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
    const testNoWork = secrets.combine(allShares.slice(0, 2))
    console.assert(testNoWork !== keyHex)
    // 3 shares
    const willWork = secrets.combine(allShares.slice(0, 3))
    console.assert(willWork === keyHex)
    console.log('combine test complete')
    //TODO
}
async function RecoverPlanFullFlow(
        vaults: {[pk: string]: Vault},
        contacts: {[name: string]: Contact}) {
    deleteAllRecoveryRelated()
    const aliceVault = vaults['alice']
    const aliceContacts = contacts['alice']
    const aliceContactsManager = new ContactsManager(aliceVault, Object.fromEntries(
        Object.values(aliceContacts).map( (c) => [c.pk, c])))
    const recoveryPlanManager = new RecoveryPlansManager(aliceVault, {}, aliceContactsManager.getContact)
    const recoveryPlan = recoveryPlanManager.createRecoveryPlan(
        'RP_01 - test', 'RP Dev Test')
    recoveryPlan.addRecoveryParty(aliceContacts['bob'], 1, true)
    recoveryPlan.addRecoveryParty(aliceContacts['charlie'], 1, false)
    recoveryPlan.addRecoveryParty(aliceContacts['dan'], 2, true)

    const byteSecret = new TextEncoder().encode('MY SECRET')
    recoveryPlan.setPayload(byteSecret, PayloadType.OBJECT)
    recoveryPlan.setThreshold(3)
    console.assert(recoveryPlan.checkValidPreSubmit())
    recoveryPlan.fsm.send('SPLIT_KEY')
    await new Promise(r => setTimeout(r, 300))
    console.log(recoveryPlan.toDict())
    console.assert(RecoveryPlanState.READY_TO_SEND_INVITES === recoveryPlan.state)
    recoveryPlan.fsm.send('SEND_INVITES')
    await new Promise(r => setTimeout(r, 300))
    const bobVault = vaults['bob']
    const guardianRequest = (await DigitalAgentService.getGetMessagesFunction(bobVault)())[0] as InboundMessageDict
    const bobContactsManager = new ContactsManager(bobVault, Object.fromEntries(
        Object.values(contacts['bob']).map( (c) => [c.pk, c])))

    const botGuardiansManager = new GuardiansManager(bobVault, {}, bobContactsManager)
    botGuardiansManager.processGuardianRequest(Message.inbound(guardianRequest))
    console.log(guardianRequest)
    // recoveryPlan.fsm.submit('SEND_INVITES')
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
}

type DevRecoveryPlanScreenProps = {
    route: {
        name: string
    }
}

const DevRecoveryPlanScreen: React.FC<DevRecoveryPlanScreenProps> = (props) => {
    const {manager} = useSessionContext()

    const [loading, setLoading] = useState(true)
    const [vaults, setVaults] = useState<{string?: Vault}>({})
    const [contacts, setContacts] = useState<{string?: Contact}>({})

    useEffect(() => {
        async function loadVaultsAndContacts() {
            const [vaults, contacts] = await getTestVaultsAndContacts()
            setVaults(vaults)
            setContacts(contacts)
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
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => RecoverPlanCreate(vaults, contacts)}>
                <Text style={ds.buttonText}>Recovery Plan Basic</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => RecoverPlanFullFlow(vaults, contacts)}>
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
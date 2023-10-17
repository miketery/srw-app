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
import { PayloadType } from '../../models/RecoveryPlan'
import { bytesToHex, hexToBytes } from '../../lib/utils'

/**
 * Test Recovery Plan Flow Messages
 */ 


async function RecoverPlanCreate(
        vaults: {[pk: string]: Vault},
        contacts: {[name: string]: Contact}) {
    console.log('[DevRecoveryPlanScreen.RecoverPlanCreate] TEST')
    // alice creates recovery w/ Bob and Charlie and Dan
    const aliceVault = vaults['alice']
    const aliceContacts = contacts['alice']
    const recoveryPlanManager = new RecoveryPlansManager(aliceVault)
    const recoveryPlan = recoveryPlanManager.createRecoveryPlan(
        'RP_01 - test', 'testing')
    recoveryPlan.addParty(aliceContacts['bob'], 1, true)
    recoveryPlan.addParty(aliceContacts['charlie'], 1, false)
    recoveryPlan.addParty(aliceContacts['dan'], 2, true)

    const byteSecret = new TextEncoder().encode('MY SECRET')
    recoveryPlan.setPayload(byteSecret, PayloadType.OBJECT)
    recoveryPlan.setThreshold(3)

    console.assert(recoveryPlan.checkValidPreSubmit())
    
    await recoveryPlan.generateKey()
    await recoveryPlan.splitKey()

    console.log(recoveryPlan.toDict())
    console.log(recoveryPlan.partys[0].toDict())
    const keyHex = bytesToHex(recoveryPlan.key)
    console.log(keyHex)

    const allShares = []
    recoveryPlan.partys.forEach( (p) => p.shares.forEach( (s) => {
        console.log(s, p.name)
        allShares.push[s]}))

    // combine test
    const testNoWork = secrets.combine(allShares.slice(0, 2))

    // should not work
    const willWork = secrets.combine(allShares.slice(0, 3))
    console.assert(willWork === keyHex)
    console.assert(testNoWork !== keyHex)
    console.log('combine test complete')
    //TODO
}
async function RecoverPlanFullFlow(
        vaults: {[pk: string]: Vault},
        contacts: {[name: string]: Contact}) {
    const aliceVault = vaults['alice']
    const aliceContacts = contacts['alice']
    const recoveryPlanManager = new RecoveryPlansManager(aliceVault)
    const recoveryPlan = recoveryPlanManager.createRecoveryPlan(
        'RP_01 - test', 'testing')
    recoveryPlan.addParty(aliceContacts['bob'], 1, true)
    recoveryPlan.addParty(aliceContacts['charlie'], 1, false)
    recoveryPlan.addParty(aliceContacts['dan'], 2, true)

    const byteSecret = new TextEncoder().encode('MY SECRET')
    recoveryPlan.setPayload(byteSecret, PayloadType.OBJECT)
    recoveryPlan.setThreshold(3)
    console.assert(recoveryPlan.checkValidPreSubmit())
    // await recoveryPlan.generateKey()
    // await recoveryPlan.splitKey()
    recoveryPlan.fsm.send('SPLIT_KEY')
    await new Promise(r => setTimeout(r, 1000))
    console.log(recoveryPlan.toDict())
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
            console.log(contacts)
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
    </ScrollView>
        {/* <View style={tw`justify-around mb-10 flex-col items-center`}>
            <Button text='Add Contact' onPress={
                () => props.navigation.navigate('ContactCreateRoute')} />
        </View> */}
    </View>
}
export default DevRecoveryPlanScreen;
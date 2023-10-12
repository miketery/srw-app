import React, { useEffect, useState } from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'

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
import { bytesToHex, hexToBytes, shamirCombine } from '../../lib/utils'

// import { test_vaults } from '../../testdata/testVaults'

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
    recoveryPlan.addParticipant(aliceContacts['bob'], 1, true)
    recoveryPlan.addParticipant(aliceContacts['charlie'], 1, false)
    recoveryPlan.addParticipant(aliceContacts['dan'], 1, true)

    const byteSecret = new TextEncoder().encode('MY SECRET')
    recoveryPlan.setPayload(byteSecret, PayloadType.OBJECT)
    recoveryPlan.setThreshold(3)

    console.log('VALID: ', recoveryPlan.checkValidPreSubmit())
    
    await recoveryPlan.generateKey()
    await recoveryPlan.splitKey()

    console.log(recoveryPlan.toDict())
    console.log(recoveryPlan.participants[0].toDict())
    
    // combine test
    const testNoWork = Array.from(recoveryPlan.participants[0].shares)
    console.log(testNoWork.length)
    // testNoWork.push(recoveryPlan.participants[1].shares[0])
    console.log(testNoWork.length)
    const a = shamirCombine(testNoWork)
    console.log(bytesToHex(a))
    // should not work
    const willWork = Array.from(recoveryPlan.participants[0].shares)
    console.log(willWork.length)
    willWork.push(recoveryPlan.participants[1].shares[0])
    willWork.push(recoveryPlan.participants[2].shares[0])
    console.log(willWork.length)
    const b = shamirCombine(willWork)
    console.log(bytesToHex(b))


    //TODO
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
    </ScrollView>
        {/* <View style={tw`justify-around mb-10 flex-col items-center`}>
            <Button text='Add Contact' onPress={
                () => props.navigation.navigate('ContactCreateRoute')} />
        </View> */}
    </View>
}
export default DevRecoveryPlanScreen;
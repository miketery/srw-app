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
    const recoveryPlanManager = new RecoveryPlansManager(aliceVault)
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
                    onPress={() => RecoverPlanCreate(manager)}>
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
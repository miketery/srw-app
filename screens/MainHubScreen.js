import { View, Text, Pressable, ScrollView } from 'react-native'
import { useEffect, useState } from 'react'

import DAS from '../services/DigitalAgentService'
import { Message, Sender, Receiver } from '../models/Message'
import { useSessionContext } from '../contexts/SessionContext'
import { MessageTypes } from '../managers/MessagesManager'

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { DEV, ROUTES } from '../config'
import { TopGradient } from '../components'


async function TestMessage(vault) {
    const sender = DAS.getSendMessageFunction(vault)
    const random_date = new Date(Math.floor(Math.random() * Date.now()));
    const msg = new Message(null, null, 'outbound', 
        Sender.fromVault(vault),
        Receiver.fromVault(vault),
        MessageTypes.app.test, '1.0',
        'X25519Box', true
    )
    msg.setData({
        'message': 'some data' + random_date.toISOString()
    })
    msg.encryptBox(vault.private_key)
    const outbound = msg.outboundFinal()
    sender(outbound)
}

function MainHubScreen(props) {
    const {vault} = useSessionContext()

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>{vault.name} — Main Hub</Text>
            </View>
            <View style={tw`flex-grow-1`} />
            <View style={tw`justify-around mb-10 flex-col items-center`}>
                <Pressable style={[ds.button, ds.blueButton, tw`w-100`]}
                    onPress={() => props.clearMessagesFetchInterval()}>
                    <Text style={ds.buttonText}>Stop Fetch Message</Text>
                </Pressable>
                <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-100`]}
                    onPress={() => TestMessage(vault)}>
                    <Text style={ds.buttonText}>App.Test Self Message</Text>
                </Pressable>
            </View>
        </ScrollView>
        <TopGradient />
        {/* <BottomGradient /> */}
        <View style={ds.buttonRowB}>
            {DEV && <Pressable style={[ds.button, tw`rounded-full`]}

                onPress={() => props.navigation.navigate(ROUTES.DevHasVaultRoute)}>
                <Text style={ds.buttonText}>Dev</Text>
            </Pressable>}
            <View style={tw`flex-grow-1`} />
            {/* <Pressable style={[ds.button, ds.greenButton, tw`rounded-full`]}
                onPress={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
                <Text style={ds.buttonText}>Create Vault</Text>
            </Pressable> */}
        </View>
    </View>
}

export default MainHubScreen
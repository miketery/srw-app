import { View, Text, Pressable, ScrollView } from 'react-native'

import { Message, Sender, Receiver } from '../models/Message'
import { useSessionContext } from '../contexts/SessionContext'
import { MessageTypes } from '../managers/MessagesManager'

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { DEV, ROUTES } from '../config'
import { TopGradient } from '../components'

import RecoverVaultHub from './RecoverVault/RecoverVaultHub'

async function TestMessage(vault) {
    const random_date = new Date(Math.floor(Math.random() * Date.now()));
    const msg = new Message(null, null, null, 'outbound', 
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
    vault.sender(outbound)
}

function MainHubScreen(props) {
    const {vault, manager} = useSessionContext()

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                {vault.recovery ? 
                <Text style={ds.header}>⚠️ Recovering Vault ⚠️</Text> :
                <Text style={ds.header}>{vault.name} — Main Hub</Text>}
            </View>
            <View style={tw`mb-10`}>
                <Text style={ds.textLg}>{vault.short_code}</Text>
            </View>
            <View style={tw`flex-grow-1`} />
            { DEV ? <View style={tw`justify-around mb-10 flex-col items-center`}>
                {props.fetching ? 
                    <Pressable style={[ds.button, ds.redButton, tw`w-100 mb-4`]}
                        onPress={() => props.clear()}>
                        <Text style={ds.buttonText}>Stop Fetch Message {props.fetching}</Text>
                    </Pressable> :
                    <Pressable style={[ds.button, ds.greenButton, tw`w-100 mb-4`]}
                        onPress={() => props.start()}>
                        <Text style={ds.buttonText}>Start Fetch Message {props.fetching}</Text>
                    </Pressable>}
                <Pressable style={[ds.button, ds.blueButton, tw`w-100 mb-4`]}
                    onPress={() => TestMessage(vault)}>
                    <Text style={ds.buttonText}>App.Test Self Message</Text>
                </Pressable>
            </View> : null}
            { vault.recovery && <RecoverVaultHub vault={vault} manager={manager} />}
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
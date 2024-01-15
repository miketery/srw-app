import { View, Text, Pressable } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from "@react-native-async-storage/async-storage"

import { ROUTES } from '../../config';
import ds from '../../assets/styles';
import tw from '../../lib/tailwind';

import { useSessionContext } from '../../contexts/SessionContext'
import { Message, Sender, Receiver } from '../../models/Message'
import { MessageTypes } from '../../managers/MessageTypes'

import { GoBackButton } from '../../components';
import MainContainer from '../../components/MainContainer'

import DevDigitalAgentScreen from './DevDigitalAgentScreen';
import DevBackupScreen from './DevBackupScreen';


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

function loadTestNotifications(manager) {
    const testNotifications = require('../../testdata/testNotifications').testNotifications
    const notificationsManager = manager.notificationsManager
    testNotifications.forEach(n => {
        notificationsManager.createNotification(n.type, n.data)
    })
}

function deleteAllLocalStorage(navigation, clear) {
    console.log('DeleteAllLocalStorage')
    clear()
    AsyncStorage.clear()
    // TODO: should be reset route
    const splash = CommonActions.reset({routes: [{name: ROUTES.SplashRoute}]});
    navigation.dispatch(splash)
}

const Stack = createNativeStackNavigator();

export function DevHasVaultNav({navigation, fetching, start, clear}) {
    const {vault, manager} = useSessionContext()

    const header = 'Dev Has Vault'
    const buttonRow = <>
        <GoBackButton onPressOut={() => navigation.goBack()} />
    </>

    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.DevGeneralRoute}>
        <Stack.Screen name={ROUTES.DefaultRoute} options={{title:'Dev Test'}}>
            {props => 
                <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
                    <View style={tw`justify-around mb-10 flex-col items-center w-full`}>
                        {fetching ? 
                            <Pressable style={[ds.button, ds.redButton, tw`w-full mb-4`]}
                                onPress={() => clear()}>
                                <Text style={ds.buttonText}>Stop Fetch Message {props.fetching}</Text>
                            </Pressable> :
                            <Pressable style={[ds.button, ds.greenButton, tw`w-full mb-4`]}
                                onPress={() => start()}>
                                <Text style={ds.buttonText}>Start Fetch Message {props.fetching}</Text>
                            </Pressable>}
                        <Pressable style={[ds.button, ds.blueButton, tw`w-full mb-4`]}
                            onPress={() => TestMessage(vault)}>
                            <Text style={ds.buttonText}>App.Test Self Message</Text>
                        </Pressable>
                    </View>
                    <Pressable style={[ds.button, ds.greenButton, tw`w-full mt-4`]}
                        onPress={() => navigation.navigate(ROUTES.DevDigitalAgentRoute)}>
                        <Text style={ds.buttonText}>Digital Agent</Text>
                    </Pressable>
                    <Pressable style={[ds.button, ds.blueButton, tw`w-full mt-4`]}
                        onPress={() => navigation.navigate(ROUTES.DevBackupRoute)}>
                        <Text style={ds.buttonText}>Backup Dev</Text>
                    </Pressable>
                    <Pressable style={[ds.button, ds.purpleButton, tw`w-full mt-4`]}
                        onPress={() => loadTestNotifications(manager)}>
                        <Text style={ds.buttonText}>Load Notifications</Text>
                    </Pressable>
                    <Pressable style={[ds.button, ds.redButton, tw`mt-4`]}
                        onPress={() => deleteAllLocalStorage(navigation, clear)}>
                        <Text style={ds.buttonText}>Delete All</Text>
                    </Pressable>
                </MainContainer>}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevDigitalAgentRoute} options={{title:'Digital Agent'}}>
            {props => 
                <DevDigitalAgentScreen {...props} />}
        </Stack.Screen>
        
        <Stack.Screen name={ROUTES.DevBackupRoute} options={{title:'Backup Testing'}}>
            {props => 
                <DevBackupScreen {...props} />}
        </Stack.Screen>
        
    </Stack.Navigator>
}

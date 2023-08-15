import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../config';

const Stack = createNativeStackNavigator();

import { Text, View, Pressable } from 'react-native'

import tw from '../lib/tailwind'
import ds from '../assets/styles'


function Test(props) {
    return (
        <View style={ds.landingContainer}>
            <Text style={ds.header}>Home</Text>
            <View>
                <Text style={ds.text}>Blah</Text>
            </View>
            <View style={tw`flex-grow-1`} />
            <View style={tw`justify-around mb-10 flex-col items-center`}>
                {/* <Pressable style={[ds.ctaButton]}
                    onPress={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
                    <Text style={ds.buttonText}>Create Vault</Text>
                </Pressable>
                <Pressable style={tw`mt-10`}
                    onPress={() => props.navigation.navigate(ROUTES.RecoverInitRoute)}>
                    <Text style={ds.textSm}>Recover Vault</Text>
                </Pressable> */}
            </View>
        </View>
    )
}

export default function HomeNav({navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.MainHubRoute}>
        <Stack.Screen name={ROUTES.MainHubRoute} options={{title:'Dev Test'}}>
            {props => 
                <Test {...props} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.NotificationsRoute} options={{title:'Notifications'}}>
            {props => 
                <View><Text style={ds.textXl}>navigation</Text></View>}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.ContactsRoute} options={{title:'Notifications'}}>
            {props => 
                <View><Text style={ds.textXl}>Contacts</Text></View>}
        </Stack.Screen>
        {/* <Stack.Screen name={ROUTES.DevTestVaultsRoute} options={{title:'Dev Test Vaults'}}>
            {props => 
                <DevTestVaultsScreen {...props} />}
        </Stack.Screen> */}
    </Stack.Navigator>
}
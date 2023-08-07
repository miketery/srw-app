import { createNativeStackNavigator } from '@react-navigation/native-stack'

import KeyShareCreate from './KeyShareCreate'  // create a KeySharey (and edit draft)
import KeyShareListScreen from './KeyShareListScreen' // list KeySharey schemes / networks
import KeyShareViewScreen from './KeyShareViewScreen' // show a KeySharey scheme
import ContactKeyShareViewScreen from './ContactKeyShareViewScreen' // show a KeySharey scheme
// import KeyShareyDeleteScreen from './KeyShareyDeleteScreen' // delete a KeySharey

const Stack = createNativeStackNavigator();

export default function KeyShareNavigator({vault, navigation}) {
    return <Stack.Navigator
    screenOptions={{headerShown: true}}
    navigation={navigation}
    initialRouteName='KeyShareListRoute'>
        <Stack.Screen name='KeyShareListRoute' options={{title:'Social Recoveries & Key Shares'}}>
            {props => 
                <KeyShareListScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='KeyShareCreateRoute' options={{title:'New Social Recovery'}}>
            {props => 
                <KeyShareCreate {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='KeyShareViewRoute' options={{title: 'Social Recovery'}}>
            {props => 
                <KeyShareViewScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='ContactKeyShareViewRoute' options={{title: 'Contact KeyShare'}}>
            {props => 
                <ContactKeyShareViewScreen {...props} vault={vault} />}
        </Stack.Screen>
        {/* <Stack.Screen name='KeyShareyDelete' options={{title: 'Delete Key Share'}}>
            {props => 
                <StorageDeleteScreen {...props} vault={vault} />}
        </Stack.Screen> */}
    </Stack.Navigator>
}
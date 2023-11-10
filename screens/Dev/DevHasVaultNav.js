import { View, Text, Pressable } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';
import DevDigitalAgentScreen from './DevDigitalAgentScreen';
import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { GoBackButton } from '../../components';

const Stack = createNativeStackNavigator();

function deleteAllLocalStorage(navigation, clear) {
    console.log('DeleteAllLocalStorage')
    clear()
    localStorage.clear()
    // window.location.reload()
    navigation.navigate(ROUTES.SplashRoute)
}

export function DevHasVaultNav({navigation, clear}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.DevGeneralRoute}>
        <Stack.Screen name={ROUTES.DefaultRoute} options={{title:'Dev Test'}}>
            {props => 
                <View style={ds.mainContainerPt}>
                    <Text style={ds.header}>Dev Has Vault</Text>
                    <Pressable style={[ds.button, ds.greenButton, tw`mt-4`]}
                        onPress={() => props.navigation.navigate(ROUTES.DevDigitalAgentRoute)}>
                        <Text style={ds.buttonText}>Digital Agent</Text>
                    </Pressable>
                    <Pressable style={[ds.button, ds.redButton, tw`mt-4`]}
                        onPress={() => deleteAllLocalStorage(navigation, clear)}>
                        <Text style={ds.buttonText}>Delete All</Text>
                    </Pressable>
                    <View style={tw`flex-grow-1`} />
                    <GoBackButton onPressOut={() => props.navigation.goBack()} />
                </View>}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevDigitalAgentRoute} options={{title:'Digital Agent'}}>
            {props => 
                <DevDigitalAgentScreen {...props} />}
        </Stack.Screen>
    </Stack.Navigator>
}

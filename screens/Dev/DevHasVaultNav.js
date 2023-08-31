import { View, Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';
import DevDigitalAgentScreen from './DevDigitalAgentScreen';

const Stack = createNativeStackNavigator();

export function DevHasVaultNav({navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.DevGeneralRoute}>
        <Stack.Screen name={ROUTES.DevGeneralRoute} options={{title:'Dev Test'}}>
            {props => 
                <View>
                    <Text>Dev General Route for Has Vault</Text>
                </View>}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevDigitalAgentRoute} options={{title:'Digital Agent'}}>
            {props => 
                <DevDigitalAgentScreen {...props} />}
        </Stack.Screen>
    </Stack.Navigator>
}

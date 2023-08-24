import { View, Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';


const Stack = createNativeStackNavigator();

export function DevHasVaultNav({navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.DevGeneralRoute}>
        <Stack.Screen name={ROUTES.DevGeneralRoute} options={{title:'Dev Test'}}>
            {props => 
                <View>
                    <Text>Testing</Text>
                </View>}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevLoadVaultsRoute} options={{title:'Dev Load Vaults'}}>
            {props => 
                <DevLoadVaultsScreen {...props} />}
        </Stack.Screen>
    </Stack.Navigator>
}

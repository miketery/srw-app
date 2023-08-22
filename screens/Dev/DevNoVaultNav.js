import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';

import DevGeneralScreen from './DevGeneralScreen';
import DevLoadVaultsScreen from './DevLoadVaultsScreen';

const Stack = createNativeStackNavigator();

export function DevNoVaultNav({navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.DevGeneralRoute}>
        <Stack.Screen name={ROUTES.DevGeneralRoute} options={{title:'Dev Test'}}>
            {props => 
                <DevGeneralScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevLoadVaultsRoute} options={{title:'Dev Load Vaults'}}>
            {props => 
                <DevLoadVaultsScreen {...props} />}
        </Stack.Screen>
    </Stack.Navigator>
}
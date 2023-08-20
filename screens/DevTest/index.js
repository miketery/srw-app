import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';

import DevTestScreen from './DevTestScreen';
import DevTestVaultsScreen from './DevTestVaultsScreen';

const Stack = createNativeStackNavigator();

export default function DevTestNavigator({navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.DevTestMainRoute}>
        <Stack.Screen name={ROUTES.DevTestMainRoute} options={{title:'Dev Test'}}>
            {props => 
                <DevTestScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevTestVaultsRoute} options={{title:'Dev Test Vaults'}}>
            {props => 
                <DevTestVaultsScreen {...props} />}
        </Stack.Screen>
    </Stack.Navigator>
}
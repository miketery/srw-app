import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';
import SecretsListScreen from './SecretsListScreen'
// import SecretCreateScreen from './SecretCreateScreen'
// import SecretViewScreen from './SecretViewScreen'
// import SecretEditScreen from './SecretEditScreen'
// import SecretDeleteScreen from './SecretDeleteScreen'
import DevSecrets from '../DevTest/DevSecrets'

const Stack = createNativeStackNavigator();

export default function SecretsNavigator({navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}}
    navigation={navigation} initialRouteName={ROUTES.SecretsListRoute}>
        <Stack.Screen name={ROUTES.SecretsListRoute} options={{title:'List Objects'}}>
            {props => 
                <SecretsListScreen {...props} />}
        </Stack.Screen>
        {/* <Stack.Screen name={ROUTES.SecretViewRoute} options={{title:'List Objects'}}>
            {props => 
                <SecretsViewScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.SecretListRoute} options={{title:'List Objects'}}>
            {props => 
                <SecretsEditScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.SecretListRoute} options={{title:'List Objects'}}>
            {props => 
                <SecretsCreateScreen {...props} />}
        </Stack.Screen> */}

        <Stack.Screen name={ROUTES.DevSecretsRoute} options={{title:'Dev SecretRoute'}}>
            {props => <DevSecrets {...props} />}
        </Stack.Screen>
    </Stack.Navigator>
}
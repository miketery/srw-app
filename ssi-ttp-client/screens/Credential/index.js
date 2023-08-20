import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ROUTES } from '../../config';

import CredentialListScreen from './CredentialListScreen';
import CredentialRequestScreen from '../Credential/CredentialRequestScreen'
import CredentialViewScreen from '../Credential/CredentialViewScreen'
import CredentialPresentScreen from '../Credential/CredentialPresentScreen'

const Stack = createNativeStackNavigator();

export default function CredentialNavigator({navigation}) {
  return <Stack.Navigator screenOptions={{headerShown: false}}
  navigation={navigation} initialRouteName={ROUTES.CredentialListRoute}>
    <Stack.Screen name={ROUTES.CredentialListRoute} options={{title:'My Credentials'}}>
      {props => 
        <CredentialListScreen {...props} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTES.CredentialViewRoute} options={{title:'View Credentials'}}>
      {props => 
        <CredentialViewScreen {...props} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTES.CredentialPresentRoute} options={{title:'Present Credential'}}>
      {props => 
        <CredentialPresentScreen {...props} />}
    </Stack.Screen>
  </Stack.Navigator>
}
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ROUTES } from '../../config';

import OrganizationListScreen from './OrganizationListScreen'
// import OrganizationCreateScreen from './OrganizationCreateScreen'
import OrganizationViewScreen from './OrganizationViewScreen'
// import OrganizationEditScreen from './OrganizationViewScreen'
// import OrganizationDeleteScreen from './OrganizationViewScreen'

import CredentialViewScreen from '../Credential/CredentialViewScreen'
import CredentialRequestScreen from '../Credential/CredentialRequestScreen'

import VerifierCreateScreen from './VerifierCreateScreen'
import VerifierViewScreen from './VerifierViewScreen'

const Stack = createNativeStackNavigator();

export default function OrganizationNavigator({navigation}) {
  return <Stack.Navigator screenOptions={{headerShown: false}}
  navigation={navigation} initialRouteName={ROUTES.OrganizationListRoute}>
    <Stack.Screen name={ROUTES.OrganizationListRoute} options={{title:'List Organizations'}}>
      {props => 
        <OrganizationListScreen {...props} />}
    </Stack.Screen>
    {/* <Stack.Screen name={ROUTES.OrganizationCreateRoute} options={{title:'Create Organization'}}>
      {props => 
        <OrganizationCreateScreen {...props}  />}
    </Stack.Screen> */}
    <Stack.Screen name={ROUTES.OrganizationViewRoute} options={{title: 'View Organization'}}>
      {props => 
        <OrganizationViewScreen {...props} />}
    </Stack.Screen>
    {/* <Stack.Screen name={ROUTES.OrganizationEditRoute} options={{title: 'Edit Organization'}}>
      {props => 
        <OrganizationEditScreen {...props} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTES.OrganizationDeleteRoute} options={{title: 'Delete Organization'}}>
      {props => 
        <OrganizationDeleteScreen {...props} />}
    </Stack.Screen> */}
    <Stack.Screen name={ROUTES.CredentialRequestRoute} options={{title: 'Request Credential'}}>
      {props =>
        <CredentialRequestScreen {...props} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTES.CredentialViewRoute} options={{title: 'View Credential'}}>
      {props =>
        <CredentialViewScreen {...props} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTES.VerifierCreateRoute} options={{title: 'Create Verifier'}}>
      {props =>
        <VerifierCreateScreen {...props} />}
    </Stack.Screen>
    <Stack.Screen name={ROUTES.VerifierViewRoute} options={{title: 'View Verifier'}}>
      {props =>
        <VerifierViewScreen {...props} />}
    </Stack.Screen>
  </Stack.Navigator>
}
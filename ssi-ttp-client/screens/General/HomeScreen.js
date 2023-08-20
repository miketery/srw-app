import { useState } from 'react'
import { Text, View, Pressable, TextInput } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { DEV, ROUTES } from '../../config'
import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { Error } from '../../components'

import Verifier from '../../classes/Verifier'

import TabNavBar from '../TabNavBar'
import OrganizationNav from '../Organization'
import CredentialNav from '../Credential'
import ProfileScreen from './ProfileScreen';
import TestScreen from './TestScreen';

const Tab = createBottomTabNavigator();

const checkValidUUID = (uuid) => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return re.test(uuid)
}

const GoToVerifierForm = (props) => {
  // verifier uuid input usestate
  const [verifierUUID, setVerifierUUID] = useState('')
  const [error, setError] = useState(null)

  const handleFindVerifier = async () => {
    console.log('[GoToVerifierForm.handleFindVerifier]', verifierUUID)
    if(checkValidUUID(verifierUUID)) {
      try {
        const verifier = await Verifier.get(verifierUUID)
        props.navigation.navigate(ROUTES.CredentialRoute, {
          state: {
            routes: [
              {name: ROUTES.CredentialListRoute},
              {
                name: ROUTES.CredentialPresentRoute,
                params: {verifier_uuid: verifier.uuid}
              }
            ]
          }
        })
      } catch (error) {
        setError('Verifier not found or unexpected error')
      }
    } else {
      setError('Invalid UUID')
    }
  }

  return <View style={tw`mt-20`}>
    <Text>Enter Verifier</Text>
    <TextInput value={verifierUUID} onChange={(event) => setVerifierUUID(event.target.value)}
      style={[ds.input, tw`w-80`]} type="text"
      placeholder="Verifier UUID"
      placeholderTextColor={"#777"} />
    <Pressable
        style={[ds.buttonSm, ds.purpleButton, tw`w-full`]}
        onPress={handleFindVerifier}>
      <Text style={ds.buttonText}>Find Verifier</Text>
    </Pressable>
    {error ? <Error error={error} /> : <View style={tw`h-22`} />}
  </View>
}


function MainHub(props) {
  return <View style={ds.mainContainerPt}>
    <Text style={ds.header}>My Hub</Text>
    <View style={tw`flex-grow-1`} />
    <View style={tw`flex flex-col items-center`}>
      <Pressable
          style={[ds.button, ds.purpleButton]}
          onPress={() => props.navigation.navigate(ROUTES.ProfileRoute)}>
        <Text style={ds.buttonText}>Profile</Text>
      </Pressable>
      <br />
      <Pressable
          style={[ds.button, ds.greenButton]}
          onPress={() => props.navigation.navigate(ROUTES.OrganizationRoute)}>
        <Text style={ds.buttonText}>Organizations</Text>
      </Pressable>
      <br />
      <Pressable
          style={[ds.button, ds.blueButton]}
          onPress={() => props.navigation.navigate(ROUTES.CredentialRoute)}>
        <Text style={ds.buttonText}>Credentials</Text>
      </Pressable>
      <GoToVerifierForm {...props} />
    </View>
    <View style={tw`flex-grow-1`} />
  </View>
}


export default function HomeScreen(props) {
  return (
    <Tab.Navigator screenOptions={({route}) => {
      return { headerShown: false }
    }} tabBar={(props) => <TabNavBar {...props} />}>
      <Tab.Screen name={ROUTES.MainHubRoute} >
        {(props) => <MainHub {...props} />}
      </Tab.Screen>
      <Tab.Screen name={ROUTES.OrganizationRoute} >
        {(props) => <OrganizationNav {...props} />}
      </Tab.Screen>
      <Tab.Screen name={ROUTES.CredentialRoute} >
        {(props) => <CredentialNav {...props} />}
      </Tab.Screen>
      <Tab.Screen name={ROUTES.ProfileRoute} >
        {(props) => <ProfileScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name={ROUTES.TestRoute} >
        {(props) => <TestScreen {...props} />}
      </Tab.Screen>
      {/* <Tab.Screen name='tabBarIconHide' title='Secrets'>
        {(props) => <StorageNav vault={this.vault} {...props} />}
      </Tab.Screen> */}
    </Tab.Navigator>
  )
}

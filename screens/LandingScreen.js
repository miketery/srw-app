import { Text, View, Pressable } from 'react-native'

import ds from '../assets/styles'
import { ROUTES } from '../config'
import tw from '../lib/tailwind'

export default function LandingScreen(props) {
  return (
    <View style={ds.landingContainer}>
      <Text style={ds.header}>ARX</Text>
      <View>
        <Text style={ds.text}>Never Lose Your Keys Again</Text>
      </View>
      <View style={tw`flex-grow-1`} />
      <View style={tw`justify-around mb-10 flex-col`}>
        <Pressable style={[ds.button, ds.greenButton]}
            onPress={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
          <Text style={ds.buttonText}>Create Vault</Text>
        </Pressable>
        <Pressable style={[ds.button, ds.lightblueButton]}
            onPress={() => props.navigation.navigate(ROUTES.LoginRoute)}>
          <Text style={ds.buttonText}>Recover Vault</Text>
        </Pressable>
      </View>
    </View>
  )
}

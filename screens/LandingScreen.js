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
      <View style={tw`justify-around mb-10 flex-col items-center`}>
        <Pressable style={[ds.ctaButton]}
            onPress={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
          <Text style={ds.buttonText}>Create Vault</Text>
        </Pressable>
        <Pressable style={tw`mt-10`}
            onPress={() => props.navigation.navigate(ROUTES.RecoverInitRoute)}>
          <Text style={ds.textSm}>Recover Vault</Text>
        </Pressable>
      </View>
    </View>
  )
}

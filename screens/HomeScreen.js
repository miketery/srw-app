import { Text, View, Pressable } from 'react-native'

import { ROUTES } from '../config'
import tw from '../lib/tailwind'
import ds from '../assets/styles'


export default function HomeScreen(props) {
  return (
    <View style={ds.landingContainer}>
      <Text style={ds.header}>Home</Text>
      <View>
        <Text style={ds.text}>Blah</Text>
      </View>
      <View style={tw`flex-grow-1`} />
      <View style={tw`justify-around mb-10 flex-col items-center`}>
        {/* <Pressable style={[ds.ctaButton]}
          onPress={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
          <Text style={ds.buttonText}>Create Vault</Text>
        </Pressable>
        <Pressable style={tw`mt-10`}
          onPress={() => props.navigation.navigate(ROUTES.RecoverInitRoute)}>
          <Text style={ds.textSm}>Recover Vault</Text>
        </Pressable> */}
      </View>
    </View>
  )
}
import { Text, View, Pressable } from 'react-native'

import ds from '../assets/styles'
import { ROUTES } from '../config'
import tw from '../lib/tailwind'

export default function VaultCreateScreen(props) {
    return (
        <View style={tw`bg-midnight h-full w-full`}>
            <Text style={tw`text-white`}>Vault Create Screen</Text>
        </View>
    )
}
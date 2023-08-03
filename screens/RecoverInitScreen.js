import { Text, View, Pressable } from 'react-native'

import ds from '../assets/styles'
import { ROUTES } from '../config'
import tw from '../lib/tailwind'

export default function RecoverInitScreen(props) {
    return (
        <View style={tw`bg-midnight h-full w-full`}>
            <Text style={tw`text-white`}>Initiate Recovery</Text>
        </View>
    )
}
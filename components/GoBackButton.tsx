import { View, Text, Pressable} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../lib/tailwind'
import ds from '../assets/styles'

export function GoBackButton(props: { onPressOut: () => void }) {
    return <Pressable onPressOut={props.onPressOut}>
        <View style={[ds.button, tw`w-16`]}>
            <Text style={ds.buttonText}>
                <Icon name='arrow-back' size={24} />
            </Text>
        </View>
    </Pressable>
}
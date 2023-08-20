import { View, Text, Pressable} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../lib/tailwind'
import ds from '../assets/styles'

export function GoBackButton(props) {
    return <Pressable onPressOut={props.onPressOut}>
        <View style={[ds.buttonXs, tw`w-16 h-8`]}>
            <Text style={ds.buttonTextSm}>
                <Icon name='arrow-back' size={24} />
            </Text>
        </View>
    </Pressable>
}

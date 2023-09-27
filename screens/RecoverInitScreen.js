import { Text, View, Pressable } from 'react-native'

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { GoBackButton } from '../components'

export default function RecoverInitScreen({navigation}) {
    return (
        <View style={ds.landingContainer}>
            <Text style={ds.header}>Recovery Vault</Text>
            <View style={[ds.col, tw`flex-grow-1`]}>
                <Text style={tw`text-white`}>TODO: not yet implemented.</Text>
            </View>
            <GoBackButton onPressOut={() => navigation.goBack()} />
        </View>
    )
}
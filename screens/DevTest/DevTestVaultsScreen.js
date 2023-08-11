import { Text, View, Pressable } from 'react-native'


import { ROUTES } from '../../config'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

export default function DevTestVaultsScreen(props) {
    return <View style={ds.landingContainer}>
        <Text style={ds.header}>Dev Test Vaults</Text>
        <View>
            <Pressable style={[ds.button, ds.blueButton]} onPress={() => console.log('Pressed')}>
                <Text style={ds.buttonText}>Test</Text>
            </Pressable>
        </View>
    </View>
}
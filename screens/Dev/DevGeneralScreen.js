import { Text, View, Pressable } from 'react-native'


import { ROUTES } from '../../config'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

export default function DevGeneralScreen({navigation}) {
    return <View style={ds.landingContainer}>
        <Text style={ds.header}>Dev Test</Text>
        <View style={ds.col}>
            <Pressable style={[ds.button, ds.blueButton]} onPress={() => console.log('Pressed')}>
                <Text style={ds.buttonText}>Test</Text>
            </Pressable>
            <Pressable style={[ds.button, ds.greenButton]} onPress={() => 
                    navigation.navigate(ROUTES.DevNoVaultRoute, 
                        {
                            // params: {vault_pk: this.vault_pk}, 
                            state: {
                                routes: [
                                    {name: ROUTES.DevLoadVaultsRoute}
                                ]
                            },
                        })}>
                <Text style={ds.buttonText}>Test Vaults</Text>
            </Pressable>
        </View>
    </View>
}
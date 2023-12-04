import { Text, View, Pressable } from 'react-native'

import ds from '../../assets/styles'
import { DEV, ROUTES } from '../../config'
import tw from '../../lib/tailwind'
import StartContainer from './StartContainer'

export default function LandingScreen(props) {
    return <StartContainer header={null}>
        <View>
            <Text style={ds.text}>Never Lose Your Keys Again</Text>
        </View>
        { DEV && <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
                onPress={() => props.navigation.navigate(ROUTES.DevNoVaultRoute)}>
            <Text style={ds.buttonText}>Dev No Vault</Text>  
        </Pressable> }
        <View style={tw`flex-grow-1`} />
        <View style={tw`justify-around mb-10 flex-col items-center`}>
            <Pressable style={[ds.ctaButton]}
                    onPressOut={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
                <Text style={ds.buttonText}>Create Vault</Text>
            </Pressable>
            <Pressable style={tw`mt-10`}
                    onPressOut={() => props.navigation.navigate(ROUTES.RecoverInitRoute)}>
                <Text style={ds.textSm}>Recover Vault</Text>
            </Pressable>
        </View>
    </StartContainer>
}

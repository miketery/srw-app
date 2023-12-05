import { Image, Pressable, Text, View } from 'react-native'

import ds from '../../assets/styles'
import { DEV, ROUTES } from '../../config'
import tw from '../../lib/tailwind'
import StartContainer from './StartContainer'
import CtaButton from '../../components/CtaButton'

export default function LandingScreen(props) {
    return <StartContainer header={null}>
        <View style={tw`flex-row justify-start my-16`}>
            <Image source={require('../../assets/logo-hor-short.png')} style={{width: 250, height: 85}} />
        </View>
        <View>
            <Text style={tw`text-[13] font-bold text-white`}>
                <Text style={tw`text-cyan-400`}>Never </Text>
                Lose{'\n'}Your Keys{'\n'}
                <Text style={tw`text-cyan-400`}>Again</Text>
            </Text>
        </View>
        <View>
            <Text style={tw`text-white text-base font-normal my-16`}>
                Set up a custom recovery protocol to protect your most important assets.
            </Text>
        </View>
        <View style={tw`justify-around mb-10 flex-col items-center`}>
            <CtaButton label="Create Vault"
                    onPressOut={() => props.navigation.navigate(ROUTES.VaultCreateRoute)} />
            <Pressable style={tw`mt-10`}
                    onPressOut={() => props.navigation.navigate(ROUTES.RecoverInitRoute)}>
                <Text style={ds.textSm}>Recover Vault</Text>
            </Pressable>
            { DEV && <Pressable style={[ds.button, tw`mt-4`]}
                    onPress={() => props.navigation.navigate(ROUTES.DevNoVaultRoute)}>
                <Text style={ds.buttonText}>Dev No Vault</Text>  
            </Pressable> }
        </View>
    </StartContainer>
}

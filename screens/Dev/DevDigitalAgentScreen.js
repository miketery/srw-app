import { Text, View, Pressable } from 'react-native'

import { ROUTES } from '../../config'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import Cache from '../../classes/Cache'
import DAI from '../../classes/DigitalAgentInterface'
import { GoBackButton } from '../../components'

function registerVault() {
    console.log('registerVault')
    const vm = Cache.vault_manager
    const vault = vm.current_vault
    DAI.registerVault(vault)
}
function amIRegistered() {
    console.log('amIRegistered')
    const vm = Cache.vault_manager
    const vault = vm.current_vault
    DAI.amIRegistered(vault)
}


export default function DevDigitalAgentScreen(props) {
    return <View style={ds.mainContainerPt}>
        <Text style={ds.header}>Dev Digital Agent Test</Text>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
            onPress={() => registerVault()}>
                <Text style={ds.buttonText}>Register Vault</Text>
            </Pressable>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
            onPress={() => amIRegistered()}>
                <Text style={ds.buttonText}>Am I Registered</Text>
            </Pressable>
        </View>
        <View style={tw`flex-grow-1`} />
        <View>
            <GoBackButton onPressOut={() => props.navigation.goBack()} />
        </View>
    </View>
}
import { Text, View, Pressable } from 'react-native'


import { ROUTES } from '../../config'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import { test_vaults } from '../../testdata/testVaults'

import VaultManager from '../../managers/VaultManager'
import { GoBackButton } from '../../components'
import Vault from '../../models/Vault'

const loadVault = (key, navigation) => {
    console.log('loadVault', key, test_vaults[key].name)
    // const vault = await VaultManager.createVault(v.name, v.display_name, v.email, v.words, '', false)
    const vault = Vault.fromDict(test_vaults[key])
    const vault_manager = new VaultManager({[vault.pk]: vault})
    vault_manager.saveVault(vault)
    console.log('vault', vault.toDict())
    navigation.navigate(ROUTES.SplashRoute)
}

function vault_buttons(navaigation) {
    return test_vaults.map((v, i) => <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]} 
            onPress={() => loadVault(i, navaigation)} key={i}>
        <Text style={ds.buttonText}>Load {v.name}</Text>
    </Pressable>)
}

function DevLoadVaultsScreen({navigation}) {
    return <View style={ds.landingContainer}>
        <Text style={ds.header}>Dev - Load Vaults</Text>
        <View style={tw`flex-grow-1`}>
            {vault_buttons(navigation)}
        </View>
        <View>
            <GoBackButton onPressOut={() => navigation.goBack()} />
        </View>
    </View>
}
export default DevLoadVaultsScreen;
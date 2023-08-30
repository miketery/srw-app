import { Text, View, Pressable } from 'react-native'


import { ROUTES } from '../../config'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import { test_vaults } from '../../testdata/testVaults'

import VaultManager from '../../classes/VaultManager'

const loadAndSaveVault = (key) => {
    console.log('loadVault', key, test_vaults[key].name)
    // const vault = await VaultManager.createVault(v.name, v.display_name, v.email, v.words, '', false)
    const vault_manager = new VaultManager()
    let vault = vault_manager.fromDict(test_vaults[key])
    vault_manager.saveVault(vault)
    console.log('vault', vault.toDict())
}

const vault_buttons = test_vaults.map((v, i) =>
    <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]} onPress={() => loadAndSaveVault(i)} key={i}>
        <Text style={ds.buttonText}>Load {v.name}</Text>
    </Pressable>
)

export default function DevTestVaultsScreen(props) {
    return <View style={ds.landingContainer}>
        <Text style={ds.header}>Dev Test Vaults</Text>
        <View>
            {vault_buttons}
        </View>
    </View>
}
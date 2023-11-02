import { Text, View, Pressable } from 'react-native'


import { ROUTES } from '../../config'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import { test_vaults } from '../../testdata/testVaults'
import { getTestContacts } from '../../testdata/testContacts'

import Vault from '../../models/Vault'
import VaultManager from '../../managers/VaultManager'
import ContactsManager from '../../managers/ContactsManager'

import { GoBackButton } from '../../components'

const loadVault = (key, navigation) => {
    console.log('loadVault', key, test_vaults[key].name)
    // const vault = await VaultManager.createVault(v.name, v.display_name, v.email, v.words, '', false)
    const vault = Vault.fromDict(test_vaults[key])
    const vaultManager = new VaultManager({[vault.pk]: vault})
    vaultManager.saveVault(vault)
    console.log('vault', vault.toDict())
    navigation.navigate(ROUTES.SplashRoute)
}
const loadFull = async (key, navigation) => {
    console.log('loadVaultAndConacts', key, test_vaults[key].name)
    const vault = Vault.fromDict(test_vaults[key])
    const vaultManager = new VaultManager({[vault.pk]: vault})
    vaultManager.saveVault(vault)
    const contacts = await getTestContacts(vault)
    const contactsManager = new ContactsManager(vault, contacts)
    await contactsManager.saveAll()
    navigation.navigate(ROUTES.SplashRoute)
}

function vault_buttons(navaigation, loadFunc) {
    return test_vaults.map((v, i) => <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full items-start pl-2`]} 
            onPress={() => loadFunc(i, navaigation)} key={i}>
        <Text style={ds.buttonText}>{loadFunc.name} - {v.name}</Text>
    </Pressable>)
}

function DevLoadVaultsScreen({navigation}) {
    return <View style={ds.landingContainer}>
        <Text style={ds.header}>Dev - Load Vaults</Text>
        <View style={tw`flex-grow-1`}>
            {vault_buttons(navigation, loadVault)}
        </View>
        <View style={tw`flex-grow-1`}>
            {vault_buttons(navigation, loadFull)}
        </View>
        <View>
            <GoBackButton onPressOut={() => navigation.goBack()} />
        </View>
    </View>
}
export default DevLoadVaultsScreen;
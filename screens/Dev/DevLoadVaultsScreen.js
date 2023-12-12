import { Text, View, Pressable } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import { ROUTES } from '../../config'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import { test_vaults } from '../../testdata/testVaults'
import { getTestContacts } from '../../testdata/genData'

import Vault from '../../models/Vault'
import VaultManager from '../../managers/VaultManager'
import ContactsManager from '../../managers/ContactsManager'
import StartContainer from '../../components/StartContainer'
import { GoBackButton } from '../../components'

const loadVault = (key, navigation) => {
    console.log('loadVault', key, test_vaults[key].name)
    // const vault = await VaultManager.createVault(v.name, v.display_name, v.email, v.words, '', false)
    const vault = Vault.fromDict(test_vaults[key])
    const vaultManager = new VaultManager({[vault.pk]: vault})
    vaultManager.saveVault(vault)
    console.log('vault', vault.toDict())
    navigation.dispatch(CommonActions.reset({routes: [{name: ROUTES.SplashRoute}]}));
}
const loadFull = async (key, navigation) => {
    console.log('loadVaultAndConacts', key, test_vaults[key].name)
    const vault = Vault.fromDict(test_vaults[key])
    const vaultManager = new VaultManager({[vault.pk]: vault})
    await vaultManager.saveVault(vault)
    const contacts = await getTestContacts(vault.name)
    const contactsManager = new ContactsManager(vault, contacts)
    await contactsManager.saveAll()
    navigation.dispatch(CommonActions.reset({routes: [{name: ROUTES.SplashRoute}]}));
}

function vault_buttons(navaigation, loadFunc, name) {
    return test_vaults.map((v, i) => <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full items-start pl-2`]} 
            onPress={() => loadFunc(i, navaigation)} key={i}>
        <Text style={ds.buttonText}>{name} - {v.name}</Text>
    </Pressable>)
}

function DevLoadVaultsScreen({navigation}) {
    return <StartContainer header={'Dev - Load Vaults'}>
        <View style={tw`flex-grow-1`}>
            {vault_buttons(navigation, loadVault, 'Basic')}
        </View>
        <View style={tw`flex-grow-1`}>
            {vault_buttons(navigation, loadFull, 'Full')}
        </View>
        <View>
            <GoBackButton onPressOut={() => navigation.goBack()} />
        </View>
    </StartContainer>
}
export default DevLoadVaultsScreen;
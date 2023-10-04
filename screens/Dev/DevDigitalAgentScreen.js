import { Text, View, Pressable } from 'react-native'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import DAS from '../../services/DigitalAgentService'
import { useSession } from '../../services/SessionContext'

import { GoBackButton } from '../../components'
import getTestVaultsAndContacts from '../../testdata/testContacts'

function registerVault(vault) {
    console.log('registerVault')
    DAS.registerVault(vault)
}
function amIRegistered(vault) {
    console.log('amIRegistered')
    DAS.amIRegistered(vault)
}
async function postMessage() {
    console.log('postMessage')
    const vm = Cache.vault_manager
    // const cm = vm.contacts_manager
    // const bob = cm.getContactByDid('Bob')
    // const vault = vm.current_vault
    // const msg = Message.forContact(vault, )
    // DAS.postMessage(vault)
    const [vaults, contacts] = await getTestVaultsAndContacts()
    console.log(vaults)
    console.log(contacts)
}


export default function DevDigitalAgentScreen(props) {
    const {vault} = useSession()

    return <View style={ds.mainContainerPt}>
        <Text style={ds.header}>Dev Digital Agent Test</Text>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
            onPress={() => registerVault(vault)}>
                <Text style={ds.buttonText}>Register Vault</Text>
            </Pressable>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
            onPress={() => amIRegistered(vault)}>
                <Text style={ds.buttonText}>Am I Registered</Text>
            </Pressable>
        </View>
        <View style={tw`flex-grow-1`} />
        <View>
            <GoBackButton onPressOut={() => props.navigation.goBack()} />
        </View>
    </View>
}
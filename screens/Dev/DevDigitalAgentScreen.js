import { Text, View, Pressable } from 'react-native'

import { ROUTES } from '../../config'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import Cache from '../../classes/Cache'
import DAI from '../../classes/DigitalAgentInterface'
import { GoBackButton } from '../../components'
import getTestContacts from '../../testdata/testContacts'

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
async function postMessage() {
    console.log('postMessage')
    const vm = Cache.vault_manager
    // const cm = vm.contacts_manager
    // const bob = cm.getContactByDid('Bob')
    // const vault = vm.current_vault
    // const msg = Message.forContact(vault, )
    // DAI.postMessage(vault)
    const contacts = await getTestContacts()
    console.log(contacts)
    // sleep 1000ms
    console.log(typeof(contacts.alice.bob))
    console.log(contacts['alice']['bob'].toDict())
    console.log(contacts['bob']['alice'].toDict())
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
            
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
            onPress={() => postMessage()}>
                <Text style={ds.buttonText}>Post Message</Text>
            </Pressable>
        </View>
        <View style={tw`flex-grow-1`} />
        <View>
            <GoBackButton onPressOut={() => props.navigation.goBack()} />
        </View>
    </View>
}
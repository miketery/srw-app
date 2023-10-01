import { Text, View, ScrollView, Pressable } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import { Button } from '../../components'
// Test Contact Add Request Messages

import Vault from '../../models/Vault'
import { test_vaults } from '../../testdata/testVaults'
import ContactsManager from '../../managers/ContactsManager'
import { ContactState } from '../../models/Contact'
import DAS from '../../services/DigitalAgentService'
import InboundMessageManager from '../../managers/MessagesManager'
import DigitalAgentService from '../../services/DigitalAgentService'

// Create contact request from Bob to Alice
async function ContactRequestFrom() {
    // given alice's DID and Public Key,
    // send contact request from Bob
    // const contact_manager = getContactsManager()
    // add BOB
    const alice_vault = Vault.fromDict(test_vaults[0])
    const alice_cm = new ContactsManager(alice_vault)
    await alice_cm.loadContacts()
    alice_cm.getContactsArray().forEach((c) => alice_cm.deleteContact(c))
    
    const bob_vault = Vault.fromDict(test_vaults[1])
    const bob_cm = new ContactsManager(bob_vault) 
    await bob_cm.loadContacts()
    bob_cm.getContactsArray().forEach((c) => bob_cm.deleteContact(c))
    bob_cm.printContacts() && alice_cm.printContacts()

    /// START
    const bob_contact =  await alice_cm.addContact('Bob', bob_vault.did, 
        bob_vault.public_key, bob_vault.verify_key, Uint8Array.from([]), '')
    console.log(bob_contact)
    console.log(alice_cm.getContactByDid(bob_contact.did).state == ContactState.INIT)
    alice_cm.printContacts()
    
    console.log('\n###################### A2 - alice_cm.contactRequest()')
    console.log(bob_contact.their_contact_public_key)
    bob_contact.fsm.send('SUBMIT')
    await new Promise(r => setTimeout(r, 300));
    const contact_request = DigitalAgentService.getLastMessage()
    console.log('[DevContacts] contact_request', contact_request) // encrypted

    console.log('\n###################### B3 - bob_cm.process_inbound_contactRequest()')
    const alice_contact = await bob_cm.processContactRequest(contact_request)
    bob_cm.printContacts()

    console.log('\n###################### B4 - bob_cm.accept_contact_request_response()')
    alice_contact.fsm.send('ACCEPT')
    await new Promise(r => setTimeout(r, 300));
    bob_cm.printContacts()
    const response = DigitalAgentService.getLastMessage()
    console.log('[DevContacts] accept_response', response) // encrypted

    console.log('\n###################### A5 - alice_cm.process_inbound_accept_contact_request_response()')
    alice_cm.processAcceptContactRequestResponse(response)
    console.log(bob_contact.toString())
    alice_cm.printContacts()
}

async function AliceToCharlieRequest() {
    const alice_vault = Vault.fromDict(test_vaults[0])
    const alice_cm = new ContactsManager(alice_vault)
    await alice_cm.loadContacts()
    const charlie_vault = Vault.fromDict(test_vaults[2])

    const charlie_contact =  await alice_cm.addContact('Charlie', charlie_vault.did, 
    charlie_vault.public_key, charlie_vault.verify_key, Uint8Array.from([]))
    const contact_request = await alice_cm.contactRequest(charlie_contact)
    console.log('=======', contact_request) // encrypted
    
    const result = DAS.postMessage(alice_vault, contact_request)
    if(!result) {
        console.log('Error sending message')
    }
    console.log('=======', result)
}
async function CharlieGetRequest() {
    const charlie_vault = Vault.fromDict(test_vaults[2])
    const messages = await DAS.getMessages(charlie_vault, 0)
    console.log(messages)
}
async function CharlieGetMessagesAndProcess() {
    const charlie_vault = Vault.fromDict(test_vaults[2])
    const messages_manager = new InboundMessageManager(charlie_vault)
    const n = messages_manager.getMessages()
    console.log('messages got:' + n)
}



export default function DevContacts(props) {
    const current_route = props.route.name
    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Dev Contacts</Text>
            </View>
            <View>
                <Text style={ds.text}>Route: {current_route}</Text>
            </View>
            <View>
                <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
                        onPress={() => ContactRequestFrom()}>
                    <Text style={ds.buttonText}>Contact Request From</Text>
                </Pressable>
            </View>
            <View>
                <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-100`]}
                        onPress={() => AliceToCharlieRequest()}>
                    <Text style={ds.buttonText}>Alice to Charlie Request via DAS</Text>
                </Pressable>
            </View>
            <View>
                <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-100`]}
                        onPress={() => CharlieGetRequest()}>
                    <Text style={ds.buttonText}>Charlie Get Messages DAS</Text>
                </Pressable>
            </View>
            <View>
                <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-100`]}
                        onPress={() => CharlieGetMessagesAndProcess()}>
                    <Text style={ds.buttonText}>Charlie InboundMessagesManager</Text>
                </Pressable>
            </View>
        </ScrollView>
        {/* <View style={tw`justify-around mb-10 flex-col items-center`}>
            <Button text='Add Contact' onPress={
                () => props.navigation.navigate('ContactCreateRoute')} />
        </View> */}
    </View>
}
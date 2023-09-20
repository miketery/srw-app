import { Text, View, ScrollView, Pressable } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import { Button } from '../../components'
// Test Contact Add Request Messages

import Vault from '../../classes/Vault'
// import { getContactsManager } from '../../classes/Cache'
import { test_vaults } from '../../testdata/testVaults'
import ContactsManager from '../../classes/ContactsManager'
import { ContactState } from '../../classes/Contact'
import DAI from '../../classes/DigitalAgentInterface'
import InboundMessageManager from '../../classes/MessagesManager'

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
        bob_vault.public_key, bob_vault.verify_key, Uint8Array.from([]))
    console.log(bob_contact)
    console.log(alice_cm.getContactByDid(bob_contact.did).state == ContactState.INIT)
    console.log(alice_cm.length == 1)
    // assertEqual(alice_cm.length, 1)
    // self.assertEqual(alice_cm.getContact(bob.did).state, ContactState.INIT)
    alice_cm.printContacts()
    
    console.log('\n###################### A2 - alice_cm.contactRequest()')
    console.log(bob_contact.their_contact_public_key)
    const contact_request = await alice_cm.contactRequest(bob_contact)
    console.log('=======', contact_request) // encrypted

    // self.assertEqual(alice_cm.getContact(bob.did).state, ContactState.REQUESTED)
    // alice_cm.print_contacts()
    // self.assertEqual(len(bob_cm.contacts), 0)

    console.log('\n###################### B3 - bob_cm.process_inbound_contactRequest()')
    const alice_contact = await bob_cm.processInboundContactRequest(contact_request)
    // self.assertEqual(len(bob_cm.contacts), 1)
    // self.assertEqual(bob_cm.getContact(alice.did).state, ContactState.INBOUND)
    bob_cm.printContacts()

    console.log('\n###################### B4 - bob_cm.accept_contact_request_response()')
    const response = await bob_cm.acceptContactRequestResponse(alice_contact)
    // self.assertEqual(bob_cm.getContact(alice.did).state, ContactState.ACCEPTED)
    bob_cm.printContacts()
    console.log('=======', response) // encrypted

    console.log('\n###################### A5 - alice_cm.process_inbound_accept_contact_request_response()')
    alice_cm.processInboundAcceptContactRequestResponse(response)
    console.log(bob_contact.toString())
    // self.assertEqual(alice_cm.getContact(bob.did).state, ContactState.ACCEPTED)
    alice_cm.printContacts()
    // vm.saveVault(alice)
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
    
    const result = DAI.postMessage(alice_vault, contact_request)
    if(!result) {
        console.log('Error sending message')
    }
    console.log('=======', result)
}
async function CharlieGetRequest() {
    const charlie_vault = Vault.fromDict(test_vaults[2])
    const messages = await DAI.getMessages(charlie_vault, 0)
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
                    <Text style={ds.buttonText}>Alice to Charlie Request via DAI</Text>
                </Pressable>
            </View>
            <View>
                <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-100`]}
                        onPress={() => CharlieGetRequest()}>
                    <Text style={ds.buttonText}>Charlie Get Messages DAI</Text>
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
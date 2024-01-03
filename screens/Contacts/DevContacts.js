import { Text, View, Pressable } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import Vault from '../../models/Vault'
import { ContactState } from '../../models/Contact'
import { Message } from '../../models/Message'
import ContactsManager from '../../managers/ContactsManager'

import { useSessionContext } from '../../contexts/SessionContext'

import { test_vaults } from '../../testdata/testVaults'
import MainContainer from '../../components/MainContainer'
import { ContactStatePill } from './ContactViewScreen'

/**
 * Test Contact Flow Messages
 */ 

async function ContactRequestFlowBasic() {
    /** 
     * Create contact request from Bob to Alice
     * given alice's DID and Public Key,
     * send contact request from Bob
     * add BOB
     */ 
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
    // bob_cm.acceptContactRequest(bob_contact.did, () => console.log('CALLBACK'))
    bob_contact.fsm.send('REQUEST', {callback: () => console.log('Sending request, CALLBACK')})
    await new Promise(r => setTimeout(r, 300));
    const contact_request = (await bob_vault.fetchMessages())[0]
    console.log('[DevContacts] contact_request', contact_request) // encrypted

    console.log('\n###################### B3 - bob_cm.process_inbound_contactRequest()')
    const alice_contact = await bob_cm.processContactRequest(Message.inbound(contact_request, bob_vault))
    await new Promise(r => setTimeout(r, 300));
    bob_cm.printContacts()

    console.log('\n###################### B4 - bob_cm.accept_contact_request_response()')
    bob_cm.acceptContactRequest(alice_contact.did, () => console.log('CALLBACK'))
    // alice_contact.fsm.send('ACCEPT')
    await new Promise(r => setTimeout(r, 1000));
    bob_cm.printContacts()
    const response = (await alice_vault.fetchMessages())[0]
    console.log('[DevContacts] accept_response', response) // encrypted

    console.log('\n###################### A5 - alice_cm.process_inbound_accept_contact_request_response()')
    alice_cm.processContactAccept(Message.inbound(response, alice_vault))
    console.log(bob_contact.toString())
    alice_cm.printContacts()
}

async function AliceToBobRequest(manager) {
    const aliceContactManager = manager.contactsManager
    aliceContactManager.getContactsArray().forEach((c) => aliceContactManager.deleteContact(c))
    await new Promise(r => setTimeout(r, 300));

    const bobVault = Vault.fromDict(test_vaults[1])
    const bobContact =  await aliceContactManager.addContact('Bob', bobVault.did, 
        bobVault.public_key, bobVault.verify_key, Uint8Array.from([]), '')
    aliceContactManager.sendContactRequest(bobContact)
    await new Promise(r => setTimeout(r, 300));
    console.log('[AliceToBobRequest] ', bobContact.toString())
}
async function ContactFullFlow(manager) {
    const aliceContactManager = manager.contactsManager
    aliceContactManager.getContactsArray().forEach((c) => aliceContactManager.deleteContact(c))
    const bobVault = Vault.fromDict(test_vaults[1])
    const bobContact =  await aliceContactManager.addContact('Bob', bobVault.did, 
        bobVault.public_key, bobVault.verify_key, Uint8Array.from([]), '')
    aliceContactManager.sendContactRequest(bobContact, () => console.log('CALLBACK on request send'))
    const contactRequest = (await bobVault.fetchMessages())[0]
    console.log(contactRequest)
    const bobContactManager = new ContactsManager(bobVault)
    const aliceContact = await bobContactManager.processContactRequest(Message.inbound(contactRequest, bobVault))
    bobContactManager.acceptContactRequest(aliceContact.did, () => console.log('CALLBACK'))
    manager.messagesManager.fetchMessages()
}

export default function DevContacts(props) {
    const {manager} = useSessionContext()

    const current_route = props.route.name
    const header = 'Dev Contacts'
    const buttonRow = <></>
    return <MainContainer header={header} buttonRow={buttonRow} color={'blue'}>
        <View>
            <Text style={ds.text}>Route: {current_route}</Text>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => ContactRequestFlowBasic()}>
                <Text style={ds.buttonText}>Contact Request Flow Basic</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => ContactFullFlow(manager)}>
                <Text style={ds.buttonText}>Alice to Bob Full Flow</Text>
            </Pressable>
        </View>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4 w-full`]}
                    onPress={() => AliceToBobRequest(manager)}>
                <Text style={ds.buttonText}>Alice to Bob Request only</Text>
            </Pressable>
        </View>
        <View style={tw`flex flex-col items-start`}>
            {Object.values(ContactState).map((state, idx) => {
                <ContactStatePill state={state} key={idx} />
            })}
        </View>
    </MainContainer>
}
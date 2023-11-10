import { Text, View, Pressable } from 'react-native'
import { useState, useEffect } from 'react'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import { GoBackButton } from '../../components'
import { getTestVaultsAndContacts } from '../../testdata/genData'
import { Message } from '../../models/Message'
import ContactsManager from '../../managers/ContactsManager'
import base58 from 'bs58'

async function sendTestMessages(vaults, contacts) {
    const alice = vaults.alice
    const bob_contact = Object.values(contacts.alice).filter(x => x.name == 'bob')[0] // alice has bob as a contact
    const msg = Message.forContact(bob_contact, 'Hello Bob', 'text', '0.0.1')
    msg.encryptBox(bob_contact.private_key)
    const from_alice = msg.outboundFinal()
    console.log('Msg from alice', from_alice)
    const for_bob = Message.inbound(from_alice, vaults.bob)
    const bob_cm = new ContactsManager(vaults.bob, Object.fromEntries(
        Object.entries(contacts.bob).map(([name, contact]) => [contact.pk, contact])))
    console.log(bob_cm.getContacts())
    console.log(for_bob.sender.did)
    const alice_contact = bob_cm.getContactByDid(for_bob.sender.did)
    console.log('alices bob: ', bob_contact)
    console.log('bobs alice: ', alice_contact)
    console.log(bob_contact.b58_public_key, bob_contact.b58_their_contact_public_key)
    console.log(alice_contact.b58_public_key, alice_contact.b58_their_contact_public_key)
    console.log(base58.encode(for_bob.sender.public_key))
    console.log(base58.encode(alice_contact.their_contact_public_key))
    const res = for_bob.decrypt(alice_contact.private_key)
    console.log('Decrypt: ', res)
    console.log('Decrypt: ', for_bob.getData())
}

export default function DevMessagesScreen(props) {
    const [loading, setLoading] = useState(true)
    const [vaults, setVaults] = useState({})
    const [contacts, setContacts] = useState({})

    useEffect(() => {
        async function loadVaultsAndContacts() {
            const [vaults, contacts] = await getTestVaultsAndContacts()
            setVaults(vaults)
            setContacts(contacts)
            console.log(contacts)
            setLoading(false)
        }
        loadVaultsAndContacts()
    }, [])

    return <View style={ds.mainContainerPt}>
        <Text style={ds.header}>Dev Messages</Text>
        <Text style={ds.textLg}>
            {loading ? 'Loading...' : 'Loaded'}
        </Text>
        <View>
            <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
            onPress={() => sendTestMessages(vaults, contacts)}>
                <Text style={ds.buttonText}>Send Test Messages</Text>
            </Pressable>
        </View>
        <View style={tw`flex-grow-1`} />
        <View>
            <GoBackButton onPressOut={() => props.navigation.goBack()} />
        </View>
    </View>
}
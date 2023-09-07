import { Text, View, Pressable } from 'react-native'
import { useState, useEffect } from 'react'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import DAI from '../../classes/DigitalAgentInterface'
import { GoBackButton } from '../../components'
import getTestVaultsAndContacts from '../../testdata/testContacts'
import { Message } from '../../classes/Message'
import ContactsManager from '../../classes/ContactsManager'

async function sendTestMessages(vaults, contacts) {
    const alice = vaults.alice
    const bob_contact = contacts.alice.bob // alice has bob as a contact
    const msg = Message.forContact(alice, bob_contact, 'Hello Bob', 'text', '0.0.1')
    msg.encryptBox(bob_contact.private_key)
    const from_alice = msg.outboundFinal()
    console.log(from_alice)
    const for_bob = Message.inbound(from_alice)
    const bob_cm = new ContactsManager(vaults.bob, Object.fromEntries(
        Object.entries(contacts.bob).map(([name, contact]) => [contact.pk, contact])))
    console.log(bob_cm.getContacts())
    // TODO: decrypt message
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
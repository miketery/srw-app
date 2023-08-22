import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';

import CM from '../../classes/ContactsManager';


export default function ContactsListScreen(props) {
    const [contacts, setContacts] = useState([])

    useEffect(() => {
        console.log('[ContactsListScreen.js] componentDidMount()')
        CM.load_contacts().then((contacts) => {
            setContacts(contacts)
        }).catch((err) => {
            console.log(err)
        })
    }, [])

    return <View>
        <Text>Contacts</Text>
        <View>
            {contacts.map((contact) => {
                return <View><Text>{contact.name}</Text></View>
            })}
        </View>
    </View>
}
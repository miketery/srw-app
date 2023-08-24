import { Pressable, Text, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { DEV, ROUTES } from '../../config';
import { TopGradient } from '../../components';

import ContactsManager from '../../classes/ContactsManager';

export default function ContactsListScreen(props) {
    const [contacts, setContacts] = useState([])

    useEffect(() => {
        console.log('[ContactsListScreen.js] componentDidMount()')
        const contacts = ContactsManager.get_contacts_array()
        setContacts(contacts.sort((a, b) => a.name.localeCompare(b.name)))
    }, [])

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Contacts</Text>
            </View>
            <View>
                {contacts.map((contact) => {
                    return <View><Text>{contact.name}</Text></View>
                })}
            </View>
        </ScrollView>
        <TopGradient />
        {/* <BottomGradient /> */}
        <View style={ds.buttonRowB}>
            {DEV && <Pressable style={[ds.button, tw`rounded-full`]}
                onPress={() => props.navigation.navigate(ROUTES.DevContactsRoute)}>
                <Text style={ds.buttonText}>Dev</Text>
            </Pressable>}
            <View style={tw`flex-grow-1`} />
            <Pressable style={[ds.button, ds.greenButton, tw`rounded-full`]}
                onPress={() => props.navigation.navigate(ROUTES.ContactCreateRoute)}>
                <Text style={ds.buttonText}>Add Contact</Text>
            </Pressable>
        </View>
    </View>
}
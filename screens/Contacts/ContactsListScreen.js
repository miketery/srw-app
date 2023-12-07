import { Pressable, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { DEV, ROUTES } from '../../config';
import MainContainer from '../../components/MainContainer';


function ContactIcon(props) {
    return <View style={tw`bg-gray-400 rounded-full h-16 w-16`} />
}

function ContactRow(props) {
    const { name, did, state } = props.contact
    return <View style={tw`flex flex-row items-center py-1 mb-1 bg-slate-600`}>
        <View style={tw`mr-1`}>
            <ContactIcon />
        </View>
        <View style={tw`flex flex-col`}>
            <Text style={ds.text}>{name}</Text>
            <Text style={ds.text}>{did}</Text>
            <Text style={ds.text}>{state}</Text>
        </View>
    </View>
}


export default function ContactsListScreen(props) {
    const [contacts, setContacts] = useState([])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            console.log('[ContactsListScreen.js] focus()')
            const contacts = props.contactsManager.getContactsArray()
            setContacts(contacts.sort((a, b) => a.name.localeCompare(b.name)))
        });
        return unsubscribe;
    }, [])

    const header = 'Contacts'
    const buttonRow = <>
        {DEV && <Pressable style={[ds.button, tw`rounded-full`]}
            onPress={() => props.navigation.navigate(ROUTES.DevContactsRoute)}>
            <Text style={ds.buttonText}>Dev</Text>
        </Pressable>}
        <View style={tw`flex-grow-1`} />
        <Pressable style={[ds.button, ds.greenButton, tw`rounded-full`]}
            onPress={() => props.navigation.navigate(ROUTES.ContactAddRoute)}>
            <Text style={ds.buttonText}>Add Contact</Text>
        </Pressable>
    </>

    return <MainContainer color='blue' header={header} buttonRow={buttonRow}>
        {contacts.map((contact) => {
            return <ContactRow contact={contact} key={contact.pk} />
        })}
    </MainContainer>
}
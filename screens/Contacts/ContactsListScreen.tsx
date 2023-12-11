import { Pressable, Text, View } from 'react-native';
import { useEffect, useState } from 'react';


import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { DEV, ROUTES } from '../../config';
import MainContainer from '../../components/MainContainer';
import Contact from '../../models/Contact';

import { ContactIcon, ContactStateText } from './ContactViewScreen';

function ContactRow({contact, navigation}: {contact: Contact, navigation: any}) {
    const { name, did, state } = contact
    return <Pressable style={tw`flex flex-row items-center py-1 mb-1`}
            onPressOut={() => navigation.navigate(ROUTES.ContactViewRoute, {contactPk: contact.pk})}>
        <View style={tw`mr-2`}>
            <ContactIcon />
        </View>
        <View style={tw`flex flex-row items-center`}>
            {ContactStateText(state)}
            <Text style={ds.textLg}>{name}</Text>
            {/* <Text style={ds.text}>{did.slice(0, 25)}...</Text> */}
        </View>
    </Pressable>
}
type ContactsListScreenProps = {
    navigation: any,
    contactsManager: any,
}


export default function ContactsListScreen(props: ContactsListScreenProps) {
    const [contacts, setContacts] = useState<Contact[]>([])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async() => {
            console.log('[ContactsListScreen.js] focus()')
            const contacts = props.contactsManager.getContactsArray()
            setContacts(contacts.sort((a: Contact, b: Contact) => a.name.localeCompare(b.name)))
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
            return <ContactRow contact={contact} key={contact.pk} navigation={props.navigation}/>
        })}
    </MainContainer>
}
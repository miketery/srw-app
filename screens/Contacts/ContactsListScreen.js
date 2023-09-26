import { Pressable, Text, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { DEV, ROUTES } from '../../config';
import { TopGradient } from '../../components';

import { getContactsManager } from '../../services/Cache';


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
            const contacts = getContactsManager().getContactsArray()
            setContacts(contacts.sort((a, b) => a.name.localeCompare(b.name)))
        });
        return unsubscribe;
    }, [])

    return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <View style={ds.headerRow}>
                <Text style={ds.header}>Contacts</Text>
            </View>
            <View>
                {contacts.map((contact) => {
                    return <ContactRow contact={contact} key={contact.pk} />
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
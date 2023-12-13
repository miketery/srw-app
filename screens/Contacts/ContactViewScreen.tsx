import { useEffect, useState } from "react";
import { Pressable, Text, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';

import ContactsManager from '../../managers/ContactsManager'
import Contact, { ContactState } from '../../models/Contact';
import MainContainer from "../../components/MainContainer";

type ContactViewScreenProps = {
    navigation: any,
    contactsManager: ContactsManager,
    route: {
        params: {
            contactPk: string,
        }
    }
}

export const ContactIcon = (props) => {
    return <View style={tw`bg-purple-400 rounded-full h-16 w-16 items-center justify-center`}>
        <Icon name='person-outline' size={32} color='white' style={tw`text-center`} />
    </View>
}

export const ContactStateText = (state: string) => {
    const style = tw`text-sm mr-2 px-2 rounded-full bg-slate-600 `
    switch (state) {
        case ContactState.INIT:
            return <Text style={[style, tw`text-slate-300`]}>Draft</Text>
        case ContactState.INBOUND:
            return <Text style={[style, tw`text-yellow-400`]}>Inbound</Text>
        case ContactState.PENDING:
            return <Text style={[style, tw`text-yellow-400`]}>Invite Sent</Text>
        case ContactState.BLOCKED:
            return <Text style={[style, tw`text-red-400`]}>Blocked</Text>
            case ContactState.ARCHIVED:
            return <Text style={[style, tw`text-green-400`]}>Archived</Text>
        default:
            return null
    }
}

const ContactCard = ({contact}: {contact: Contact}) => {
    const { name, did, state } = contact
    return <View>
        <View style={tw`flex flex-row items-center py-1 mb-1`}>
            <View style={tw`mr-2`}>
                <ContactIcon />
            </View>
            <View>
                <View style={tw`flex flex-row items-center`}>
                    {ContactStateText(state)}
                    <Text style={ds.textLg}>{name}</Text>
                </View>
                <Text style={ds.text}>{did.slice(0, 25)}...</Text>
            </View>
        </View>
        <View style={tw`flex flex-row items-center py-1 mb-1`}>
            <View style={tw`mr-2`}>
                <Icon name='mail-outline' size={32} color='white' style={tw`text-center`} />
            </View>
            <View>
                <Text style={ds.textLg}>{contact.b58_their_verify_key}</Text>
            </View>
        </View>
    </View>
}

const ContactViewScreen = (props: ContactViewScreenProps) => {
    // props get contactPk from nav
    const [contact, setContact] = useState<Contact>(null)
    // const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const contactPk = props.route.params.contactPk
        const contact = props.contactsManager.getContact(contactPk)
        setContact(contact)
        setLoading(false)
    }, [])
    const header = 'Contact Details'

    return <MainContainer header={header} buttonRow={null} color={'blue'}>
        {loading && <Text>Loading...</Text>}
        {/* {error && <Text>{error}</Text>} */}
        {contact && <ContactCard contact={contact} />}
    </MainContainer>
    
}

export default ContactViewScreen;
import * as React from 'react'
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'


import SI from '../../classes/SI'
import { LoadingScreen } from '../../components'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'


const mock_data = [
    {name: 'anthony', verif_key: '01234567890abcdef'}
]

const ContactRow = (props) => {
    const contact = props.contact
    const isPending = contact.state === 0
    return <Pressable key={contact['pk']} style={ds.row} onPress={
            () => props.navigation.navigate('ContactViewRoute', {contact_pk: contact['pk']})}>
        <View style={tw`flex flex-row justify-between w-full`}>
            <View><Text style={{color: "white"}}>{contact['name']}</Text></View>
            {isPending && <View><Text style={tw`text-yellow-300 italic`}>[Request Pending]</Text></View>}
        </View>
    </Pressable>
}


export default class ContactListScreen extends React.Component {
    vault = null
    contacts = []
    state = {loading: true,}
    constructor(props) {
        super(props)
        this.vault = props.vault
    }
    focus = () => {
        console.log('[ContactListScreen.focus]')
        this.getItems()
    }
    componentDidMount() {
        console.log('[ContactListScreen.componentDidMount]')
        this.focus()
        this.props.navigation.addListener('focus', this.focus)
    }
    getItems() {
        console.log('[ContactListScreen.getItems]')
        SI.getAll('contacts', this.vault.pk).then(contacts => {
            this.contacts = contacts
            this.contacts.sort((a, b) =>
                a['name'].toLowerCase() > b['name'].toLowerCase() ? 1 : -1)
            console.log(this.contacts)
            this.setState({loading: false})
        })
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        let rows = []
        this.contacts.forEach(contact => 
            rows.push(<ContactRow
                navigation={this.props.navigation}
                contact={contact}
                key={contact.pk} />)
        )
        return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <Text style={ds.header}>Contacts</Text>
                <View style={ds.rows}>
                    {rows}
                </View>
                {rows.length == 0 ? <Text style={ds.text}>You have no contacts, add some.</Text>: null}
            </ScrollView>
            <View style={ds.buttonRow}>
                <Text style={ds.text}>
                    {rows.length} contacts
                </Text>
                <Pressable onPress={() => this.props.navigation.navigate(
                    'ContactCreateRoute')}
                    style={[ds.button, ds.blueButton]}>
                    <Text style={ds.buttonText}>Add Contact</Text>
                </Pressable>
            </View>
        </View>
    }

}

const styles = StyleSheet.create({
})

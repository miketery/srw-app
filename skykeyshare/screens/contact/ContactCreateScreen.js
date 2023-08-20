import React from 'react'
import Clipboard from '@react-native-clipboard/clipboard'
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native'
import { CommonActions, StackActions } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'

import base58 from 'bs58'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import Contact from '../../classes/Contact'
import { Card, FieldError, Info, Loading, LoadingScreen, Warning } from '../../components'

import axios from 'axios'
import { BASE } from '../../config'
import SI from '../../classes/SI'

const keyStyle = tw`text-blue-300 font-mono text-lg`

function ContactCard(props) {
    const c = props.contact
    return <Card label={c.name} icon='person'>
        <View style={tw`flex flex-row items-start`}>
            <Text style={[ds.text, tw`mr-3`]}>
                <Icon name="key" size={22} />
            </Text>
            <View>
                <Text style={[ds.text, tw`mb-1`]}>
                Public Identity Key (ed25519)
                </Text>
                <Pressable style={tw`flex flex-row justify-between`}
                onPress={() => Clipboard.setString(c.verify_key)}>
                    <Text style={keyStyle}>
                        {c.verify_key.slice(0, 22) +'\n'+c.verify_key.slice(22)}
                    </Text>
                    <Text style={[keyStyle, tw`self-center pl-4`]}>
                        <Icon name='copy-outline' size={22} />
                    </Text>
                </Pressable>
            </View>
        </View>
        {c.pk_if_exists ? <View>
            <Info t='Already have this contact' />
            <View style={tw`flex-row justify-center my-2`}>
                <Pressable style={[ds.button, ds.blueButton]} onPressOut={() => props.viewContact(c.pk_if_exists)}>
                    <Text style={ds.buttonText}>View Contact</Text>
                </Pressable>
            </View>
        </View> :
        <View>
            <Info t={'Check with your contact that the above Public Identity Key is theirs.'} />
            <View style={tw`flex-row justify-center my-2`}>
                <Pressable style={[ds.button, ds.greenButton]} onPressOut={props.sendInvite}>
                    <Text style={ds.buttonText}>Send Invite</Text>
                </Pressable>
            </View>
        </View>
        }
    </Card>
}

export default class ContactCreateScreen extends React.Component {
    contact = null
    vault = null
    state = {
        code: '',
        loading: true,
        codeToggle: true,
        fetching: false,
        not_found: false,
        errors: {},
    }
    contact_verify_keys = []
    constructor(props) {
        super(props)
        // this.vault_pk = props.vault_pk ? props.vault_pk : props.route.params.vault_pk
        this.vault = props.vault
    }
    componentDidMount() {
        this.setup()
    }
    async setup() {
        const contacts = await SI.getAll('contacts')
        contacts.map(x => JSON.parse(x[1])).map(c => {
            this.contact_verify_keys[c.their_verify_key] = c.pk
        })
        console.log(this.contact_verify_keys)
        this.setState({loading: false, my_name: this.vault.my_name})
    }
    lookup = () => {
        const signed_payload = this.vault.createSignedPayload({
            code: this.state.code})
        axios.post(BASE + '/user/code/', signed_payload).then(res => {
            const data = res.data
            this.contact = Contact.create(data.name,
                base58.decode(data.verify_key),
                base58.decode(data.public_key),
                '', this.vault)
                console.log(data)
            this.contact.short_code = data.short_code
            console.log(this.contact.toDict())
            this.setState({
                contact: {
                    name: this.contact.name,
                    public_key: this.contact.publicKeyBase58(),
                    verify_key: this.contact.verifyKeyBase58(),
                    pk_if_exists: this.contact_verify_keys[this.contact.verifyKeyBase58()] || false,
                },
                not_found: false,
                fetching: false,
            })
        }).catch(err => {
            console.log(err)
            this.setState({fetching: false, not_found: true})
        })
    }
    handleCodeChange = (data) => {
        this.setState({code: String(data.slice(0,6)).replace(/[^\w]{1,6}/g, '')})
    }
    finishSubmit = () => {
        console.log('[ContactCreateScreen.finishSubmit]', this.contact.pk)
        this.viewContact(this.contact.pk)
    }
    handleLookup = () => {
        console.log('[ContactCreateScreen.handleLookup]')
        this.setState({fetching: true}, this.lookup())
    }
    sendInvite = () => {
        console.log('[ContactCreateScreen.sendInvite]')
        if(this.contact_verify_keys.includes(this.contact.verifyKeyBase58())) {
            this.setState({errors: {general: 'Contact already added'}, loading: false})
            return
        }
        this.contact.make_contact_request(
            this.state.my_name,
            this.vault, 
            () => this.contact.save(() => this.finishSubmit()),
            (err) => {
                console.log(err)
                this.setState({errors: {general: 'Something went wrong sending invite.'}, loading: false})
            })
        // need try catch in case error here.
    }
    viewContact = (pk) => {
        const replaceAction = StackActions.replace(
            'ContactViewRoute', {contact_pk: pk})
        this.props.navigation.dispatch(replaceAction)
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        return <View style={ds.mainContainerPt}>
            <Text style={ds.header}>Contact</Text>
            <View style={{}}>
                <Text style={ds.label}>Short Code</Text>
                <TextInput style={[ds.input, tw`text-center text-3xl font-mono text-blue-300`]}
                    onChangeText={this.handleCodeChange}
                    value={this.state.code} />
                <FieldError name='general' errors={this.state.errors} />
            </View>
            <View style={tw`flex-col grow`}>
                {this.state.fetching ? <View style={tw`my-5`}><Loading /></View> : 
                this.state.not_found ? <Text style={tw`my-2 text-yellow-300`}>No contact found, or server error.</Text> :
                this.contact ? <ContactCard
                    contact={this.state.contact}
                    sendInvite={this.sendInvite}
                    viewContact={this.viewContact} /> : null}
            </View>
            <View style={ds.buttonRow}>
                <View />
                <Pressable onPressOut={() => this.handleLookup()}
                        style={[ds.button, ds.blueButton]}>
                    <Text style={ds.buttonText}>Lookup</Text>
                </Pressable>
            </View>
        </View>
    }
}



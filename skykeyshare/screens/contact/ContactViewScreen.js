import axios from 'axios'
import React from 'react'
import Clipboard from '@react-native-clipboard/clipboard'
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import { BASE } from '../../config'
import { LoadingScreen, Card, ErrorScreen, GoBackButton } from '../../components'
import Contact from '../../classes/Contact'

const iconSize = 22
export default class ContactViewScreen extends React.Component {
    contact_pk = null
    contact = null
    state = {loading: true, error: null}
    constructor(props) {
        super(props)
        this.vault = props.vault
        this.contact_pk = props.route.params.contact_pk
        console.log('[ContactViewScreen]', this.contact_pk)
    }
    focus = () => {
        Contact.load(this.contact_pk).then(contact => {
            this.contact = contact
            if(this.contact.short_code == '')
                this.updateFromServer()
            console.log('[ContactViewScreen.componentDidMount]', this.contact)
            this.setState({loading: false})
        }).catch(e => {
            this.setState({error: 'Couldnt find contact'})
            console.log(e)
        })
    }
    updateFromServer = () => {
        const payload = {verify_key: this.contact.verifyKeyBase58()}
        const signed_payload = this.vault.createSignedPayload(payload)
        axios.post(BASE+'/user/verify_key/', signed_payload)
        .then(res => {
            console.log(res)
            this.contact.short_code = res.data.short_code
            this.contact.save()
            this.forceUpdate()
        })
        .catch(e => {console.log(e)})
    }
    componentDidMount() {
        this.focus()
        this.props.navigation.addListener('focus', this.focus)
    }
    render() {
        if(this.state.error)
            return <ErrorScreen error={this.state.error} />
        if(this.state.loading)
            return <LoadingScreen />
        const verify_key = this.contact.verifyKeyBase58()
        const public_key = this.contact.publicKeyBase58()
        return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <Text style={ds.header}>Contact</Text>
            <Card label={this.contact.name} icon='person'>
                {this.contact.state === 0 && 
                    <View style={ds.cardRowStyle}>
                        <Text style={tw`text-yellow-300 italic`}>[Request Pending]</Text>
                    </View>}
                <View style={ds.cardRowStyle}>
                    <Text style={[ds.text, tw`mr-3`]}>
                        <Icon name="key" size={iconSize} />
                    </Text>
                    <View>
                        <Text style={[ds.text, tw`mb-1`]}>
                        Public Identity Key (ed25519)
                        </Text>
                        <Pressable style={ds.blueCopyBox}
                            onPress={() => Clipboard.setString(verify_key)}>
                            <Text style={ds.keyStyle}>
                                {verify_key.slice(0, 22) +'\n'+verify_key.slice(22)}
                            </Text>
                            <Text style={[ds.keyStyle, tw`self-center pl-4`]}>
                                <Icon name='copy-outline' size={iconSize} />
                            </Text>
                        </Pressable> 
                    </View>
                </View>
                <View style={ds.cardRowStyle}>
                    <Text style={[ds.text, tw`mr-3`]}>
                        <Icon name="document-text" size={iconSize} />
                    </Text>
                    <View>
                        <Text style={[ds.text, tw`mb-1`]}>
                            Notes
                        </Text>
                        <Text style={ds.text}>{this.contact.notes || '[no notes]'}</Text>
                    </View>
                </View>
                <View style={ds.cardRowStyle}>
                    <Text style={[ds.text, tw`mr-3`]}>
                        <Icon name="flash" size={iconSize} />
                    </Text>
                    <View>
                        <Text style={[ds.text, tw`mb-1`]}>
                            Contact Invite Code
                        </Text>
                        <Pressable style={ds.blueCopyBox}
                            onPress={() => Clipboard.setString(this.contact.short_code)}>
                            <Text style={[ds.keyStyle, tw`text-2xl`]}>
                                {this.contact.short_code || '[no code]'}
                            </Text>
                            <Text style={[ds.keyStyle, tw`self-center pl-4`]}>
                                <Icon name='copy-outline' size={iconSize} />
                            </Text>
                        </Pressable>
                    </View>
                </View>
                <View style={ds.cardRowStyle}>
                <Text style={[ds.text, tw`mr-3`]}>
                        <Icon name="wallet" size={iconSize} />
                    </Text>
                    <View>
                        <Text style={[ds.text, tw`mb-1`]}>
                            Todo: Shared wallets
                        </Text>
                        <Text></Text>
                    </View>
                </View>
            </Card>
            {/* <View style={tw`p-4 rounded-xl bg-green-800 mb-4`}>
                <Text style={tw`text-2xl text-slate-300`}>Activity</Text>
            </View>
            <View style={tw`p-4 rounded-xl bg-sky-800 mb-4`}>
                <Text style={tw`text-2xl text-slate-300`}>Shared</Text>
            </View> */}
        </ScrollView>
        <View style={ds.buttonRow}>
            <GoBackButton onPressOut={() => this.props.navigation.navigate('ContactListRoute')} />
            <Pressable onPressIn={() => this.props.navigation.navigate(
                    'ContactEditRoute', {contact_pk: this.contact_pk})}
                    style={[ds.button, ds.purpleButton, tw`w-40`]}>
                <Text style={ds.buttonText}>Edit</Text>
            </Pressable>
        </View>
    </View>
    }

}

const styles = StyleSheet.create({
    first: {
        backgroundColor: 'black',
    }
})
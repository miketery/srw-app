import * as React from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import { GoBackButton, LoadingScreen } from '../../components'

import Contact from '../../classes/Contact'
import { ContactForm } from './components/ContactForm'

import ds from '../../assets/styles'

export default class ContactEditScreen extends React.Component {
    contact_pk = ''
    contact = null
    state = {
        name: '',
        notes: '',
        their_verify_key: '',
        loading: true,
    }
    constructor(props) {
        super(props)
        this.contact_pk = props.route.params.contact_pk
    }
    componentDidMount() {
        Contact.load(this.contact_pk).then(contact => {
            this.contact = contact
            this.setState({
                name: this.contact.name,
                notes: this.contact.notes,
                their_verify_key: this.contact.verifyKeyBase58(),
                loading: false
            })
        })
    }
    handleNameChange = (data) => {
        this.setState({name: data})
    }
    handleNotesChange = (data) => {
        this.setState({notes: data})
    }
    finishSubmit() {
        console.log('[ContactEditScreen.finishSubmit] '+this.contact.pk)        
        this.props.navigation.goBack()
    }
    handleSubmit = () => {
        console.log('[ContactEditScreen.handleSubmit]')
        this.contact.update(this.state.name, this.state.notes)
        this.contact.save(() => this.finishSubmit()) 
    }
    toDeleteScreen = () => {
        this.props.navigation.navigate('ContactDeleteRoute', {contact_pk: this.contact.pk})
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
        <Text style={ds.header}>Contact</Text>
        <ContactForm state={this.state}
            handleNameChange={this.handleNameChange}
            handleNotesChange={this.handleNotesChange}
            toDeleteScreen={this.toDeleteScreen}
        />
        </ScrollView>
        <View style={ds.buttonRow}>
            <GoBackButton onPressOut={() => this.props.navigation.goBack()} />
            <Pressable onPressOut={() => this.handleSubmit()}
                    style={[ds.button, ds.greenButton]}>
                <Text style={ds.buttonText}>Update</Text>
            </Pressable>
        </View>
        </View>
    }
}


import React from 'react'
import { Text, View, Pressable, ScrollView, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../../../lib/tailwind'
import ds from '../../../assets/styles'

import SI from '../../../classes/SI'
import { FieldError, LoadingScreen } from '../../../components'
import base58 from 'bs58'
import { ParticipantRoles } from '../../../classes/Participant'

const removeArrayItem = (array, index) => {
    const newArray = [...array]
    newArray.splice(index, 1)
    return newArray
}

export class WalletParticipantSelect extends React.Component {
    contacts = []
    participants = []
    vault = null
    wallet = null
    state = {
        loading: true,
        search: '',
        participant_count: 0,
    }
    constructor(props) {
        console.log('[WalletParticipantSelect.constructor]')
        super(props)
        this.vault = props.vault
        this.wallet = props.wallet
        this.participants = this.wallet.participants
        .map(p => ({
            verify_key: base58.encode(p.verify_key),
            name: p.name,
            publicKey: base58.encode(p.publicKey),
            role: p.role,
        }))
        if(this.participants.length === 0)
            this.participants.push({name: this.vault.my_name, verify_key: base58.encode(this.vault.verify_key), role: ParticipantRoles.OWNER})
        this.state.participant_count = this.participants.length
    }
    focus = () => {
        console.log('[WalletParticipantSelect.focus]')
        SI.getAll('contacts', this.wallet.vault_pk).then(contacts => {
            this.contacts =  contacts
            this.contacts.sort((a, b) =>
                a['name'].toLowerCase() > b['name'].toLowerCase() ? 1 : -1)
            this.setState({loading: false, participant_count: this.participants.length})
            this.props.setParticipants(this.participants)
        })
    }
    componentDidMount() {
        console.log('[WalletParticipantSelect.componentDidMount]')
        this.focus()
        this.props.navigation.addListener('focus', this.focus)
    }
    handleSearchChange = (text) => {
        this.setState({search: text})
    }
    removeParticipant = (index) => {
        this.participants = removeArrayItem(this.participants, index)
        this.props.setParticipants(this.participants) // set parent component
        this.setState({participant_count: this.participants.length})
    }
    participantIndex = (verify_key) => {
        return this.participants.findIndex(p => p.verify_key === verify_key)
    }
    findParticipants = (verify_key) => {
        return this.participants.find(p => p.verify_key == verify_key)
    }
    addParticipant = (contact) => {
        // const to_add = {name: contact.name, pk: contact.pk, verify_key: base58.decode(contact.verify_key)}
        if(this.participantIndex(contact.verify_key) >= 0) return
        this.participants.push({name: contact.name, verify_key: contact.their_verify_key})
        this.props.setParticipants(this.participants) // set parent component
        this.setState({participant_count: this.participants.length, search: ''})
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        const count = this.state.participant_count  
        const selected = this.participants.map((p, i) => {
            const isOwner = p.role === ParticipantRoles.OWNER
            return <View key={i} style={[tw`rounded-full border px-2 m-1 flex-row justify-center items-center`,
                    isOwner ? tw`bg-darkgreen border-midgreen` : tw`bg-darkblue border-lightblue`]}>
                <Text style={tw`text-slate-200 ml-1 py-0.5`}>
                    {p.name}
                </Text>
                {isOwner ? <Text style={tw`text-blue-200 py-0.5 ml-1 font-mono`}>{'<you>'}</Text> :
                <Pressable onPress={() => this.removeParticipant(i)}>
                    <Text style={tw`text-slate-200 -mr-1 ml-1`}>
                        <Icon name="close-outline" size={20} />
                    </Text>
                </Pressable>}
            </View>
        })
        const filtered = this.state.search.length == 0 ? [] :
            this.contacts.filter(c =>
                c['name'].toLowerCase().includes(this.state.search.toLowerCase()))
                // c['username'].toLowerCase().includes(this.state.search.toLowerCase()))
        return <View style={tw``}>
        <Text style={ds.label}>Select Participants</Text>
        { count ? <Text style={tw`mb-1 italic text-sm text-blue-400`}>
            {count} participants</Text>: null}
        { count ? <View style={tw`flex-row justify-start -mx-1 -mt-1 mb-1 flex-wrap`}>
            {selected}</View>: null}
        <View style={tw`flex-row items-center`}>
            <TextInput style={ds.input}
                onChangeText={this.handleSearchChange}
                value={this.state.search}
                placeholder='Search' />
            <View style={tw`absolute right-2 -mt-1`}>
                <Text style={tw`text-slate-500`}>
                    {this.state.search.length > 0 ?
                    <Pressable onPress={() => this.setState({search: ''})}>
                        <Icon name='close' size={30} />
                    </Pressable> :
                    <Icon name='search' size={30} />
                    }
                </Text>
            </View>
        </View>
        { this.state.search.length == 0 ? null : 
            filtered.length > 0 ?
                <ScrollView style={tw`-mt-2`}>
                    {filtered.map((c, i) => {
                    const index = this.participantIndex(c.their_verify_key)
                    const isSelected = index >= 0
                    return <Pressable key={i}
                        onPress={() => !isSelected ? this.addParticipant(c) : this.removeParticipant(index)}
                        style={tw`w-full p-2 bg-darkblue border border-lightblue flex-row justify-between`}>
                            <Text style={isSelected ? tw`text-blue-400` : tw`text-slate-200`}>{c.name}</Text>
                            {isSelected ? <Text style={tw`text-blue-400`}>
                                <Icon name='checkmark' size={12} /></Text>:null}
                        </Pressable>
                    })}
                </ScrollView> : <Text style={tw`text-slate-200`}>No results.</Text>
        }
        <FieldError name='participants' errors={this.props.errors} />
        </View>
    }
}
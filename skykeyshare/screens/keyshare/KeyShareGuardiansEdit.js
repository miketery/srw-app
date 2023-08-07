import React from 'react'
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'


import SI from '../../classes/SI'
import tw from '../../lib/tailwind'
import ds from '../../assets/styles'


import {KeyShare, Guardian, Share} from '../../classes/KeyShare'
import { LoadingScreen } from '../../components'
import { hexToBytes } from '../../lib/utils'
import base58 from 'bs58'

function Error(props) {
    if(Object.keys(props.errors).includes(props.name))
        return <View style={tw`mx-3 my-1`}>
            <Text style={tw`text-yellow-300`}>
                {props.errors[props.name]}
            </Text>
        </View>
    return null
}

export default class GuardianScreen extends React.Component {
    contacts = []
    vault = null
    keyshare = null
    state = {
        loading: true,
        contactFilter: '',
        totalGuardians: 0,
    }
    constructor(props) {
        super(props)
        this.contacts = props.contacts
        this.keyshare = props.keyshare
    }        
    componentDidMount() {
        this.setState({loading: false})
    }
    testing() {
        if(this.keyshare.guardianCount() == 0)
            for(let i = 0; i < 3; i++) {
                this.toggelContact(this.contacts[i])
            }
    }
    handleFilterChange = (data) => {
        this.setState({contactFilter: data})
    }
    toggelContact(c) {
        let new_g = new Guardian(c.name, base58.decode(c.their_verify_key), base58.decode(c.public_key))
        if(this.keyshare.verify_keyInSet(c.their_verify_key)) {
            this.keyshare.removeGuardian(new_g)
        } else {
            this.keyshare.addGuardian(new_g)
        }
        this.setState({totalGuardians: this.keyshare.guardianCount()})
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        let rows = this.contacts.filter(c => 
                c.name.toLowerCase().includes(String(this.state.contactFilter).toLowerCase())
            ).map(c => {
                let chosen = this.keyshare.verify_keyInSet(c.their_verify_key)
                return <Pressable key={c.pk} onPress={() => this.toggelContact(c)}
                        style={[ds.row, ds.rowSpaceBetween, tw`items-center`,
                            chosen ? tw`bg-blue-800` : null]}>
                    <Text style={{color: 'white'}}>{c.name}</Text>
                    {chosen ? <Icon name="checkmark-circle" color='yellow' size={24}></Icon> :
                        <Icon name="ellipse-outline" color='white' size={24}></Icon>}
                </Pressable>
            })
        return (<View>
            <View style={tw`mx-3 mb-3`}>
                <Text style={ds.text}>
                    Add Guardians from your contacts.{'\n'}
                    {/* or write name & phone number. */}
                    Currently {this.state.totalGuardians} guardian(s) added.
                </Text>
            </View>
            <TextInput  style={ds.input} onChangeText={this.handleFilterChange} placeholder='Search Contacts' />
            <Error name='guardians' errors={this.props.errors} />
            <View style={tw`mt-2`}>
                {rows}
            </View>
        </View>)
    }
}
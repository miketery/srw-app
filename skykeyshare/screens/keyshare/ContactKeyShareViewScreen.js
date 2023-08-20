import * as React from 'react'
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import QRCode from 'react-native-qrcode-svg'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import { ContactKeyShare } from '../../classes/KeyShare'
import { Error, LoadingScreen } from '../../components'

import Contact from '../../classes/Contact'

function ShareCard(props) {
    let show = props.show_shares
    let shares = props.shares.map((s, i) => <View style={tw`items-center mt-2 border-t-2 border-white`} key={i}>
        {/* <Text>{s.value}</Text> */}
        <Text style={ds.textLg}>Share: {i+1}</Text>
        <QRCode value={'sky:ks:'+s.value} size={150} />
    </View>)
    return <View style={tw`p-4 rounded-3xl bg-purple-900 mb-4`}>
        <View style={tw`flex-row justify-between items-center`}>
        <Text style={tw`text-2xl text-slate-300 mb-2`}>Shares</Text>
            <Pressable onPressOut={props.toggle}>
                <Text style={tw`p-2 text-white fonr-bold text-center bg-blue-800 w-15 rounded-lg`}>
                    {show ? 'Hide' : 'Show'}
                </Text>
            </Pressable>
        </View>
        <View>
            <Text style={ds.text}>You have {shares.length} share(s).</Text>
            <View>
                {show ? 
                    shares : null }
            </View>
        </View>
    </View>
}

function ManifestCard(props) {
    let m = props.manifest
    return <View style={tw`p-4 rounded-3xl bg-sky-800 mb-4`}>
        <Text style={tw`text-2xl text-slate-300`}>{m.name}</Text>
        <View style={tw`flex-row mb-3`}>
            <View style={tw`mr-2 items-end`}>
                <Text style={tw`text-yellow-300 font-bold`}>{m.share_count}</Text>
                <Text style={tw`text-yellow-300 font-bold`}>{m.threshold}</Text>
            </View>
            <View>
                <Text style={ds.text}>Total shares</Text>
                <Text style={ds.text}>Threshold (shares to recover)</Text>
            </View>
        </View>
        <View>
            <Text style={ds.textLg}>Guardians</Text>
            {m.guardians
            .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
            .map((g, i) => <View style={tw`flex-row mb-2`} key={i}>
                <Text style={[ds.text, tw`mr-2`]}><Icon name="person" size={18}></Icon></Text>
                <Text style={ds.text}>{g.name}</Text>
            </View>)}
        </View>
    </View>
}

function ContactCard(props) {
    return <View style={tw`p-4 rounded-3xl bg-green-800 mb-4`}>
        <Text style={tw`text-2xl text-slate-300 mb-2`}>Contact</Text>
        {props.state.contact_error ? <Text style={ds.text}>Error loading contact: no associated contact found.</Text> :
            props.state.loading_contact ? 
                <Text style={ds.text}>Loading contact details...</Text> :
                <Text style={ds.textLg}>{props.contact.name}</Text>}
    </View>
}

export default class KeyShareViewScreen extends React.Component {
    state = {
        loading: true,
        loading_contact: true,
        contact_error: false,
        show_shares: false,
    }
    contact_keyshare_pk = null
    contact_keyshare = null
    vault = null

    constructor(props) {
        super(props)
        this.vault = props.vault
        this.contact_keyshare_pk = props.route.params.contact_keyshare_pk
    }
    componentDidMount() {
        ContactKeyShare.load(this.contact_keyshare_pk).then(k => {
            this.contact_keyshare = k
            this.loadContact(this.contact_keyshare.contact_pk)
            console.log(k)
            this.setState({loading: false})
        }).catch(e => {
            this.setState({error: e.message})
        })
    }
    async loadContact(contact_pk) {
        try {
            this.contact = await Contact.load(contact_pk)
            this.setState({loading_contact: false})
        } catch(e) {
            this.setState({contact_error: 'Error loading contact'})
        }
    }
    render() {
        if(this.state.error)
            return <Error error={this.state.error} />
        if(this.state.loading)
            return <LoadingScreen />
        return <ScrollView style={ds.mainContainer}>
            <ManifestCard manifest={this.contact_keyshare.manifest} />
            <ContactCard contact={this.contact} state={this.state} />
            <ShareCard
                toggle={() => this.setState({show_shares: !this.state.show_shares})}
                show_shares={this.state.show_shares}
                shares={this.contact_keyshare.shares} />
        </ScrollView>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

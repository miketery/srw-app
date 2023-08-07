import * as React from 'react'
import Clipboard from '@react-native-clipboard/clipboard'
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'

import QRCode from 'react-native-qrcode-svg'

import { DEV } from '../config'
import SI from '../classes/SI'
import tw from '../lib/tailwind'
import ds from '../assets/styles'

function ActionCard(props) {
    return <View style={tw`flex-column`}>
        {props.icon}
        {props.label}
        {props.content}
    </View>
}

export default class MainHubScreen extends React.Component {
    state = {
        wipe_count: 0,
    }
    constructor(props) {
        super(props)
    }
    generateCards() {
        const data = SI.getData()
        const num_contacts = data['contacts_index'].length
        const num_wallets = data['wallets_index'].length
        const num_smart_wallets = data['smart_wallets_index'].length
    }
    wipeAll() {
        // deletes all asyncstoragedata and reloads app
        let c = this.state.wipe_count
        if(c < 1) {
            this.setState({wipe_count: c+1})
            return
        }
        let resetAction = CommonActions.reset({
            routes: [{
                name: 'SplashRoute'
            }]
        })
        SI.clear(() => {
            clearInterval(this.ni_interval_handler)
            this.props.navigation.dispatch(resetAction)
        })
    }
    render() {
        let qr_code=this.props.vault.inviteString() // 'https://sky.tmisha.com/i/q?' + 
        return (<View style={ds.mainContainerPt}>
            <View style={tw`flex-col mb-4`}>
                <View style={tw`py-2 bg-indigo-900 rounded-lg`}>
                    <Text style={tw`text-slate-300 text-center text-3xl`}>{this.props.vault.my_name}</Text>
                </View>
            </View>
            <View>
                
            </View>
            <View style={{flex:1}} />
            <View style={{alignItems: 'center'}}>
                <View style={{backgroundColor: 'white', padding: 10, width: 120}}>
                    <QRCode value={qr_code} size={100} />
                </View>
            </View>
            <View style={{padding: 10, marginVertical: 10, backgroundColor: '#444'}}>
                <Pressable onPress={() => Clipboard.setString(this.props.vault.inviteString())}>
                    <Text style={ds.text} selectable={true} on>
                        {qr_code}
                    </Text>
                    {/* <Icon name='copy-outline' color='white' size={22}></Icon> */}
                </Pressable>
            </View>
            <View style={tw`flex flex-col items-center justify-center my-4`}>
                <Text style={ds.textLg}>Contact Invite Code</Text>
                <Pressable style={[ds.blueCopyBox, tw`px-6`]}
                onPress={() => Clipboard.setString(this.props.vault.short_code)}>
                    <Text style={tw`text-blue-300 font-mono text-2xl`}>
                        {this.props.vault.short_code}
                    </Text>
                    <Text style={tw`text-blue-300 ml-3`}>
                        <Icon name='copy-outline'size={22}></Icon>
                    </Text>
                </Pressable>
            </View>
            <View style={{flex:1}} />
            <View style={ds.buttonRow}>
                {/* <Pressable onPress={() => this.props.navigation.navigate('KeySharesRoute', {
                    params: {vault_pk: this.vault_pk}, 
                    state: {
                        routes: [
                            {name: 'KeyShareList'},
                        ]
                    },
                })} style={[ds.button, ds.blueButton]}>
                    <Text style={ds.buttonText}>View Recoveries</Text>
                </Pressable> */}
                <View></View>
                <Pressable onPress={() => this.props.navigation.navigate('ContactsRoute', {
                    params: {vault_pk: this.vault_pk}, 
                    state: {
                        routes: [
                            {name: 'ContactListRoute'},
                            {name: 'ContactCreateRoute'}
                        ]
                    },
                })} style={[ds.button, ds.blueButton]}>
                    <Text style={ds.buttonText}>Add Contact</Text>
                </Pressable>
            </View>
            { DEV && 
            <View style={ds.buttonRow}>
                <Pressable onPress={() => this.wipeAll()}
                        style={[ds.button, ds.redButton]}>
                    <Text style={ds.buttonText}>{this.state.wipe_count == 0 ? 'WIPE DATA!!!' : 'Click Again!'}</Text>
                </Pressable>
                <Pressable onPress={() => this.props.navigation.navigate('ProfileRoute', {})}
                        style={[ds.button, ds.blueButton]}>
                    <Text style={ds.buttonText}>Profile</Text>
                </Pressable>
            </View>}
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

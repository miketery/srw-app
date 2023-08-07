import React from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'

import tw from '../../lib/tailwind'

import ds from '../../assets/styles'
import NI from '../../classes/NI'
import { process_contact_request } from '../../classes/Contact'
import { process_keyshare_request } from '../../classes/KeyShare'
import { process_wallet_invite } from '../../classes/SmartWallet'


function ContactRequest({cr, acceptRequest, deleteRequest}) {
    return <View style={style.request} key={cr.pk}>
        <View style={tw`flex-row`}>
            <Text><Text style={tw`font-bold`}>{cr.data.name}&nbsp;</Text>
            sent you a contact request</Text>
        </View>
        <View><Text style={{fontSize: 10}}>Identity: {cr.data.verify_key}</Text></View>
        <View style={style.buttonsRow}>
            <Pressable style={[ds.buttonSm, ds.greenButton, tw`mr-2`]} onPress={() => acceptRequest(cr)}>
                <Text style={ds.buttonTextSm}>Accept</Text>
            </Pressable>
            <Pressable style={ds.buttonSm} onPress={() => deleteRequest(cr)}>
                <Text style={ds.buttonTextSm}>Delete</Text>
            </Pressable>
        </View>
    </View>
}
function ContactAccept ({ca, dismissAccept}) {
    return <View style={style.request} key={ca.pk}>
        <View style={tw`flex-row`}>
            <Text><Text style={tw`font-bold`}>{ca.name_if_contact}&nbsp;</Text>
            has accepted your contact request</Text>
        </View>
        <View style={style.buttonsRow}>
            <Pressable style={ds.buttonSm} onPress={() => dismissAccept(ca)}>
                <Text style={ds.buttonTextSm}>Dismiss</Text>
            </Pressable>
        </View>
    </View>
}
function WalletInvite({wi, acceptWalletInvite, deleteRequest}) {
    return <View style={style.request} key={wi.pk}>
        <View style={tw`flex-row`}>
            <Text><Text style={tw`font-bold`}>{wi.name_if_contact}&nbsp;</Text>
            sent you an invite to "{wi.data.payload.name}" (a multi party wallet)</Text>
        </View>
        <View style={style.buttonsRow}>
            <Pressable style={[ds.buttonSm, ds.greenButton, tw`mr-2`]} onPress={() => acceptWalletInvite(wi)}>
                <Text style={ds.buttonTextSm}>Accept</Text>
            </Pressable>
            <Pressable style={ds.buttonSm} onPress={() => deleteRequest(wi)}>
                <Text style={ds.buttonTextSm}>Delete</Text>
            </Pressable>
        </View>
    </View>
}
function WalletAccept({wa, dismissAccept}) {
    return <View style={style.request} key={wa.pk}>
        <View style={tw`flex-row`}>
            <Text><Text style={tw`font-bold`}>{wa.name_if_contact}&nbsp;</Text>
            has accepted your wallet invite</Text>
        </View>
        <View style={style.buttonsRow}>
            <Pressable style={ds.buttonSm} onPress={() => dismissAccept(wa)}>
                <Text style={ds.buttonTextSm}>Dismiss</Text>
            </Pressable>
        </View>
    </View>
}
function KeyShareRequest({kr, acceptKeyShareRequest, deleteRequest}) {
    return <View style={style.request} key={kr.pk}>
        <View style={tw`flex-row`}>
            <Text><Text style={tw`font-bold`}>{kr.name_if_contact}&nbsp;</Text>
            sent you a Key Share for future recovery purposes</Text>
        </View>
        {/* <View><Text style={{fontSize: 10}}>Identity: XXX</Text></View> */}
        <View style={style.buttonsRow}>
            <Pressable style={[ds.buttonSm, ds.greenButton, tw`mr-2`]} onPress={() => acceptKeyShareRequest(kr)}>
                <Text style={ds.buttonTextSm}>Accept</Text>
            </Pressable>
            <Pressable style={ds.buttonSm} onPress={() => deleteRequest(kr)}>
                <Text style={ds.buttonTextSm}>Delete</Text>
            </Pressable>
        </View>
    </View>
}
function KeyShareAccept({ka, dismissAccept}) {
    return <View style={style.request} key={ka.pk}>
        <View style={tw`flex-row`}>
            <Text><Text style={tw`font-bold`}>{ka.name_if_contact}&nbsp;</Text>
            has accepted your contact Key Share</Text>
        </View>
        <View style={style.buttonsRow}>
            <Pressable style={ds.buttonSm} onPress={() => dismissAccept(ka)}>
                <Text style={ds.buttonTextSm}>Dismiss</Text>
            </Pressable>
        </View>
    </View>
}

export default class NotificationsListScreen extends React.Component {
    state = {}
    constructor(props) {
        super(props)
        this.vault = props.vault
        console.log('[NotificationsListScreen.constructor]', this.vault.pk)
        console.log(props.notifications)
        props.navigation.addListener('focus', this.load)
    }
    componentDidMount() {
        this.checkNotifications()
        // setInterval(this.checkNotifications, 5*1000)
    }
    load = () => {
        console.log('[NotificationListScreen.load] focus!')
    }
    checkNotifications() {
    }
    acceptRequest = (contact_request) => {
        console.log('[NotificationsListScreen.acceptRequest]')
        process_contact_request(contact_request, this.vault,
            () => {
                NI.deleteNotification(contact_request.pk).then(
                    n => this.props.setNotifications(n)
                )
            },
            (err) => {console.log(err)}
        )
    }
    deleteRequest = (contact_request) => {
        NI.deleteNotification(contact_request.pk).then(
            n => this.props.setNotifications(n)
        )
    }
    dismissAccept = (accept) => {
        NI.deleteNotification(accept.pk).then(
            n => this.props.setNotifications(n)
        )
    }
    acceptKeyShareRequest = (keyshare_request) => {
        process_keyshare_request(keyshare_request, this.vault,
            () => {
                NI.deleteNotification(keyshare_request.pk)
                .then(
                    n => this.props.setNotifications(n)
                )
            },
            (err) => {console.log(err)}
        )
    }
    acceptWalletInvite = (wallet_invite) => {
        process_wallet_invite(wallet_invite, this.vault)
        .then(res =>{
            if('pk' in res) {
                NI.deleteNotification(wallet_invite.pk)
                .then(
                    n => this.props.setNotifications(n)
                )
                this.props.navigation.navigate('WalletsRoute', {
                    screen: 'SmartWalletViewRoute',
                    params: {wallet_pk: res.pk}
                })
            } else if('error' in res) {
                console.log(res.error)
            } else {
                throw new Error('Unknown response from process_wallet_invite')
            }
        }).catch(err => {
            console.log('[NotificationListScreen.acceptWalletInvite]', err)
        })
    }
    render() {
        let rows = []
        const notifications = this.props.notifications['notifications']
        console.log(notifications)
        Object.keys(notifications).forEach(pk => {
            const n = notifications[pk]
            switch (n['type_name']) {
                case 'contact_request':
                    rows.push(<ContactRequest key={n.pk} cr={n}
                        acceptRequest={this.acceptRequest}
                        deleteRequest={this.deleteRequest} />)
                    break;
                case 'contact_accept':
                    rows.push(<ContactAccept key={n.pk} ca={n}
                        dismissAccept={this.dismissAccept} />)
                    break;
                case 'keyshare_request':
                    rows.push(<KeyShareRequest key={n.pk} kr={n}
                        acceptKeyShareRequest={this.acceptKeyShareRequest} 
                        deleteRequest={this.deleteRequest} />)
                    break;
                case 'keyshare_accept':
                    rows.push(<KeyShareAccept key={n.pk} kr={n}
                        dismissAccept={this.dismissAccept} />)
                    break;
                case 'wallet_invite':
                    // TODO: update deleteRequest to right function
                    rows.push(<WalletInvite key={n.pk} wi={n} 
                        acceptWalletInvite={this.acceptWalletInvite} 
                        deleteRequest={() => console.log(n)} />)
                    break;
                case 'wallet_accept':
                    rows.push(<WalletAccept key={n.pk} wa={n}
                        dismissAccept={this.dismissAccept} />)
                    break;
                default:
                    rows.push(<View style={ds.row} key={pk}>
                        <View style={ds.col}>
                            <Text style={ds.text}>Warning: unprocessed Notifications...</Text>
                            <Text style={ds.text}>Please send us a bug report for "{n.type_name}"</Text>
                        </View>
                    </View>)
            }
        })
        return <View style={ds.mainContainerPtGradient}>
            <ScrollView style={ds.scrollViewGradient}>
                <Text style={ds.header}>Notifications</Text> 
                <View>
                    {rows.length ? rows : <Text style={ds.text}>No notifications.</Text>}
                </View>
            </ScrollView>
        </View>
    }
}

const style = StyleSheet.create({
    request: tw`mb-2 flex-col p-2 rounded-lg bg-gray-400`,
    buttonsRow: tw`mt-2 flex-row justify-end`,
})

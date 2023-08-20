import React from 'react'
import { StyleSheet, Text, View, ScrollView, Pressable, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import QRCode from 'react-native-qrcode-svg'
import Clipboard from '@react-native-clipboard/clipboard'

import Cache from '../../classes/Cache'

import { TEST, BLOCKAPI_ENABLED, BLOCKAPI_TIMEOUT } from '../../config'
import tw from '../../lib/tailwind'
import ds from '../../assets/styles'
import { bytesToHex, toHHMMSS, toYYYYMMDD_HHMMSS } from '../../lib/utils'

import { LoadingScreen, Error, ErrorScreen, TopGradient, BottomGradient } from '../../components'
import { Wallet, mBTC, submBTC } from '../../classes/Wallet'
import WalletSendScreen from './WalletSendScreen'
import { WalletMainCard, WalletTransactions, WalletReceiveCard } from './WalletViewScreen'
import SmartWallet from '../../classes/SmartWallet'

const RoleCommon = tw`mx-1 py-0.5 px-2 rounded-full`
const RoleStyles = {
    owner: [tw`border-2 border-blue-800`, RoleCommon],
    signer: [tw`border-2 border-green-800`, RoleCommon],
    viewer: [tw`border-2 border-yellow-600`, RoleCommon],
    you: [tw`border-2 border-purple-800`, RoleCommon]
}
const StateCommon = tw`font-mono b`
const StateStyles = {
    draft: [tw`text-yellow-400`, StateCommon],
    pending: [tw`text-yellow-400`, StateCommon],
    accepted: [tw`text-green-600`, StateCommon],
    declined: [tw`text-red-400`,  StateCommon],
    uninformed: [tw`text-slate-200`, StateCommon],
    custom: [tw`text-purple-400`, StateCommon]
}

const WalletParticipant = ({navigate, participant, my_verify_key, verify_key_to_contact_pk}) => {
    const verify_key = participant.verify_key_base58
    const isMe = verify_key == my_verify_key
    const [toggle, setToggle] = React.useState(false)
    const contact_pk = verify_key in verify_key_to_contact_pk ? 
        verify_key_to_contact_pk[verify_key] : false
    return  <Pressable style={tw`border-b border-slate-300 flex flex-col py-3`} onPress={() => setToggle(!toggle)}>
        <View style={tw`flex flex-row items-center`}>
            <Text style={ds.textLg}>{participant.name}</Text>
            <View style={RoleStyles[participant.role]}>
                <Text style={[ds.text, tw`font-mono`]}>{participant.role}</Text>
            </View>
            {isMe && <View style={RoleStyles['you']}>
                <Text style={[ds.text, tw`i font-mono`]}>[YOU]</Text>
            </View>}
            <View style={tw`flex-grow-1`} />
            <View style={tw``}>
                <Text style={[...StateStyles[participant.state]]}>{participant.state}</Text>
            </View>
        </View>
        {toggle && <View style={tw``}>
            <View style={tw`flex flex-row items-start mt-3`}>
                <Text style={[ds.text, tw`mr-3`]}>
                    <Icon name="key" size={22} />
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
                            <Icon name='copy-outline' size={22} />
                        </Text>
                    </Pressable> 
                </View>
            </View>
            {!isMe && <View style={tw`mt-3`}>
                {contact_pk && <View style={tw`flex flex-column items-center`}>
                    <Pressable style={[ds.buttonSm, ds.blueButton]}
                    onPress={() => navigate('ContactsRoute',
                        {
                            screen: 'ContactViewRoute',
                            params: {contact_pk: contact_pk}
                        })}>
                        <Text style={ds.buttonTextSm}>
                            View Contact
                        </Text>
                    </Pressable>
                </View>}
            </View>}
        </View>}
    </Pressable>
}

const WalletParticipants = ({navigate, participants, my_verify_key, verify_key_to_contact_pk}) => <View>
    {participants.map((participant, index) => 
        <WalletParticipant key={index}
            navigate={navigate}
            participant={participant}
            my_verify_key={my_verify_key}
            verify_key_to_contact_pk={verify_key_to_contact_pk} />)}
</View>


export default class SmartWalletViewScreen extends React.Component {
    wallet_pk = null
    vault = null
    contacts = null
    wallet = null
    addresses = []
    chain_txs = []
    mempool = []
    fetch_stats_interval_handler = null
    state = {
        chain_balance: 0,
        mempool_balance: 0,
        chain_count: 0,
        mempool_count: 0,
        showDetails: false,
        transactionsToggle: false,
        showReceive: false,
        showSend: false,

        verify_key_to_contact_pk: {},
        loading: true, 
        error: false
    }
    constructor(props) {
        super(props)
        this.wallet_pk = props.route.params.wallet_pk
        console.log('[SmartWalletViewScreen.constructor] '+this.wallet_pk)
    }
    componentWillUnmount() {
        console.log('[SmartWalletViewScreen.componentWillUnmount]')
        clearInterval(this.fetch_stats_interval_handler)
    }
    componentDidMount() {
        Promise.all([
            Cache.getVault()
                .then(vault => this.vault = vault),
            Cache.getContacts()
                .then(contacts => {
                    this.contacts = contacts
                    const verify_key_to_contact_pk = {}
                    this.contacts.forEach(contact => {
                        verify_key_to_contact_pk[contact.their_verify_key] = contact.pk
                    })
                    this.setState({
                        verify_key_to_contact_pk: verify_key_to_contact_pk
                    })
                }),
            SmartWallet.load(this.wallet_pk)
                .then(wallet => {
                    this.wallet = wallet
                    this.addresses = [this.wallet.address]
                    // first time force (will check stats, and mempool)
                    // TODO: use cache for mempool so doesnt force that unless stats change...
                    this.fetchStats(true)
                    if(BLOCKAPI_ENABLED)
                        this.fetch_stats_interval_handler = setInterval(
                            () => this.fetchStats(), 2000)
                    console.log('done get smart wallet')
                }).catch(e => {
                    console.log('[SmartWalletViewScreen.componentDidMount] error loading this wallet: ', this.wallet_pk)
                    console.error(e)
                    this.setState({error: 'Couldn\'t load Wallet. Go back and try again.'})
                })
        ]).then(() => 
            this.setState({
                loading: false,
                // chain_balance: this.wallet.getBalance()
            })
        )
    }
    fetchStats(force=false) {
        console.log(this.wallet.toDict())
        return
        // check last time fetch (to not overload server)
        if(!force && this.wallet.last_fetch > Date.now() - BLOCKAPI_TIMEOUT * 1000)
            return true
        console.log('[SmartWalletViewScreen.fetchStats] wallet.last_fetch', 
            toHHMMSS(new Date(this.wallet.last_fetch)))
        this.wallet.fetchStats().then(result => {
            this.setState({chain_balance: this.wallet.getBalance()})
            // fetch transactions if stats dont match what we have stored
            this.chain_txs = this.wallet.getTransactions()
            this.setState({chain_count: this.chain_txs.length})
            // fetch mempool
            this.mempool = this.wallet.getTransactions(true)
            this.setState({mempool_count: this.mempool.length})
        }).catch(err => {
            // this.setState({error: 'Something went wrong fetching transactions.'})
        })
    }
    render() {
        if(this.state.error)
            return <ErrorScreen error={this.state.error} />
        if(this.state.loading)
            return <LoadingScreen />
        // if(this.state.showReceive)
        //     return <View style={ds.mainContainerPt}>
        //         <WalletReceiveCard wallet={this.wallet}
        //             exitReceive={() => this.setState({showReceive: false})} />
        //         <View style={{flex: 1}} />
        //         <View style={ds.buttonRow}>
        //             <Pressable onPressOut={() => this.setState({showReceive: false})}>
        //                 <View style={[ds.button, tw`w-16`]}>
        //                     <Text style={ds.buttonText}>
        //                         <Icon name='arrow-back' size={24} />
        //                     </Text>
        //                 </View>
        //             </Pressable>
        //         </View>
        //     </View>
        // if(this.state.showSend)
        //     return <WalletSendScreen wallet={this.wallet}
        //         exitSend={() => this.setState({showSend: false})}
        //         fetchStatsForced={() => this.fetchStats(true)} />
        return <View style={ds.mainContainerPtGradient}>
            <ScrollView style={tw`pb-16 pt-11`}>
                <View style={tw`flex flex-row items-center mb-4`}>
                    <Image source={require('../../assets/omnichannel-slate.png')} style={tw`h-8 w-8 mr-2`} />
                    <Text style={ds.text2xl}>{this.wallet.name}</Text>
                </View>
                <View>
                    <WalletParticipants 
                        navigate={this.props.navigation.navigate}
                        participants={this.wallet.participants}
                        my_verify_key={''}
                        verify_key_to_contact_pk={this.state.verify_key_to_contact_pk} />
                </View>
                <View style={tw`p-3 flex flex-col justify-center items-center`}>
                    <Pressable onPressOut={() => this.wallet.sendInvites(this.vault)} style={ds.button}>
                        <Text style={ds.buttonText}>Send Invites Test</Text>
                    </Pressable>
                    <br />
                    <Pressable onPressOut={() => this.wallet.createOnServer(this.vault)} style={ds.button}>
                        <Text style={ds.buttonText}>Create On Server</Text>
                    </Pressable>
                    <br />
                    <Pressable onPressOut={() => this.vault.createSigner(this.wallet)} style={ds.button}>
                        <Text style={ds.buttonText}>Create Signer</Text>
                    </Pressable>
                </View>
                {/* <WalletMainCard wallet={this.wallet}
                    chain_balance={this.state.chain_balance}
                    detailsToggle={() => this.setState({showDetails: !this.state.showDetails})}
                    showReceive={() => this.setState({showReceive: true})}
                    showSend={() => this.setState({showSend: true})}
                    showDetails={this.state.showDetails} /> */}
                {/* <WalletTransactions 
                    chain_count={this.state.chain_count} 
                    mempool_count={this.state.mempool_count}
                    txs={[...this.chain_txs, ...this.mempool]}
                    addresses={this.addresses} /> */}
            </ScrollView>
            <TopGradient />
            <BottomGradient />
            <View style={ds.buttonRow}>
                <Pressable onPressOut={() => this.props.navigation.navigate('WalletListRoute')}>
                    <View style={[ds.button, tw`w-16`]}>
                        <Text style={ds.buttonText}>
                            <Icon name='arrow-back' size={24} />
                        </Text>
                    </View>
                </Pressable>
                <Pressable onPressIn={() => this.props.navigation.navigate(
                        'WalletEditRoute', {wallet_pk: this.wallet_pk})}
                        style={[ds.button, ds.purpleButton, tw`w-30`]}>
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
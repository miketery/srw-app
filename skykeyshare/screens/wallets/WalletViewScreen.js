import React from 'react'
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import QRCode from 'react-native-qrcode-svg'
import Clipboard from '@react-native-clipboard/clipboard'


import { TEST, BLOCKAPI_ENABLED, BLOCKAPI_TIMEOUT } from '../../config'
import tw from '../../lib/tailwind'
import ds from '../../assets/styles'
import { bytesToHex, toHHMMSS, toYYYYMMDD_HHMMSS } from '../../lib/utils'

import { LoadingScreen, Error, TopGradient, BottomGradient } from '../../components'
import { Wallet, mBTC, submBTC } from '../../classes/Wallet'
import WalletSendScreen from './WalletSendScreen'

function WalletMainCard(props) {
    const addresses = props.wallet.receive_nodes.map((r, i) => <View key={i}>
            {/* <Text style={ds.textXs}>{r.p2wpkh()}</Text> */}
            <Text style={ds.textXs}>p2wpkh:{r.toWIF()}</Text>
            <Text style={ds.textXs}>{bytesToHex(r.node.privateKey)}</Text>
    </View>)
    return <View>
    <View style={tw`px-4 py-2 rounded-t-xl bg-slate-400`}>
        <View style={tw`bg-slate-400 flex-row justify-between items-center`}>
            <Text style={tw`text-black text-2xl`}>{props.wallet.name}</Text>
            <Pressable onPressIn={() => props.detailsToggle()}>
                <Icon name='ellipsis-vertical' size={20} color='black' />
            </Pressable>
        </View>
    </View>
    <View style={tw`px-4 rounded-b-xl bg-slate-700 mb-4 pb-4`}>
        <View style={tw`flex-row items-end justify-center my-4`}>
            {/* <Icon name='logo-bitcoin' color='#F1F9F5' size={30}/> ₿*/}
            <Text style={tw`text-slate-100 text-3xl`}>{props.chain_balance / 10**5}</Text>
            <Text style={tw`text-slate-100 text-xl`}>mBTC</Text>
        </View>
        <View style={tw`flex-row justify-between`}>
            <Pressable style={[ds.button, ds.greenButton]} onPressIn={props.showReceive}>
                <Text style={ds.buttonText}>
                    Receive&nbsp;
                    <Icon name='download-outline' size={24}/>
                </Text>
            </Pressable>
            <Pressable style={[ds.button, ds.blueButton]} onPressIn={props.showSend}>
                <Text style={ds.buttonText}>
                    Send&nbsp;
                    <Icon name='open-outline' size={22}/>
                </Text>
            </Pressable>
        </View>
        {props.showDetails ?
        <View style={tw`mt-3`}>
            <Text style={ds.textXs}>
                Extended Public: {props.wallet.root.neutered().toBase58()}
            </Text>
            {addresses}
        </View> : null }
        {props.wallet.notes && false ? 
        <View>
            <Text style={ds.text}>{props.wallet.notes || '[no notes]'}</Text>
        </View> : null}
    </View>
    </View>
}
function WalletReceiveCard(props) {
    const qr_code = props.wallet.receive_nodes[0].p2wpkh()
    return <View>
    <View style={tw`px-4 py-2 rounded-t-xl bg-slate-400`}>
        <View style={tw`bg-slate-400 flex-row justify-between items-center`}>
            <Text style={tw`text-black text-2xl`}>Receive</Text>
            <Pressable onPressIn={props.exitReceive}>
                <Icon name='close-outline' size={24} color='black' />
            </Pressable>
        </View>
    </View>
    <View style={tw`px-4 rounded-b-xl bg-slate-700 mb-4 py-4 items-center`}>
        <View style={tw`p-2 bg-slate-100`}>
            <QRCode value={qr_code} size={240} />
        </View>
        <View style={tw`mt-4`}>
            <Text style={ds.text}>{qr_code}</Text>
        </View>
        <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]}
                onPress={() => Clipboard.setString(qr_code)}>
            <Text style={ds.buttonText}>
                Copy&nbsp;
                <Icon name='copy-outline' size={20}/>
            </Text>
        </Pressable>
    </View>
    </View>
}
function parseTx(tx, addresses, prev_balance) {
    // console.log(tx)
    let debit = 0
    let credit = 0 
    let total_out = 0
    tx['vin'].map(vin => {
        if(addresses.includes(vin['prevout']['scriptpubkey_address']))
            debit += vin['prevout']['value']
    })
    tx['vout'].map(vout => {
        if(addresses.includes(vout['scriptpubkey_address']))
            credit += vout['value']
        if(debit != 0)
            total_out += vout['value']
    })
    const delta = credit - debit
    return {
        debit: debit, credit: credit, total_out: total_out,
        fee: tx['fee'], block_time: tx['status']['block_time'],
        delta: delta, 
        balance: prev_balance + delta,
        my_fee: debit - total_out, txid: tx['txid'],
        confirmed: tx['status']['confirmed'],
    }
    
}

const SatsFormatted = ({sats, color, italic}) => <View style={tw`items-end`}>
    <Text style={[ds.textLg, color, italic]}>{mBTC(sats)}.</Text>
    <Text style={[tw`text-xs -mt-1`, color, italic]}>{submBTC(sats)}</Text>
</View>
function Transaction(props) {
    const isConfirmed = props.confirmed
    const balanceStyle = isConfirmed ? tw`text-slate-50` : tw`text-yellow-200`
    const creditStyle = tw`text-green-500`
    const debitStyle = tw`text-red-400`
    const rowStyle = [tw`mx-2 py-2 flex-row items-center`, 
        !isConfirmed ? tw`pl-2 pr-1 mr-1 border-l-2 border-yellow-200 bg-slate-700` 
        : tw`border-b-2 border-slate-600`]
    return <View style={rowStyle}>
        <View>
            {props.confirmed ?
            <Text style={ds.textXs}>{toYYYYMMDD_HHMMSS(new Date(props.block_time*1000)).split(' ').join('\n')}</Text>
            : <Text style={tw`text-yellow-200 italic`}>
                Pending <Icon name='timer-outline' size={16}/>
            </Text>}
        </View>
        {/* <View style={tw`flex-row`}> */}
            <View style={tw`grow items-end justify-end`}>
                <SatsFormatted sats={props.delta}
                    color={props.delta > 0 ? creditStyle : debitStyle} 
                    italic={isConfirmed ? null : tw`italic`}
                />
            </View>
            <View style={tw`w-30 items-end`}>
                <SatsFormatted sats={props.balance}
                    color={balanceStyle} 
                    italic={isConfirmed ? null : tw`italic`}
                />
            </View>
        {/* </View> */}
    </View>
}
function WalletTransactions(props) {
    // const transactions = props.txs.map((t, i) => <Transaction key={i} tx={t} addresses={props.addresses} />)
    let transactions = []
    let balance = 0
    for(let i = 0; i < props.txs.length; i++) {
        let parsed = parseTx(props.txs[i], props.addresses, balance)
        transactions.push(<Transaction key={i} {...parsed} />)
        balance = parsed['balance']
    }
    transactions.reverse()
    return <View>
    <View style={tw`px-4 py-2 rounded-t-xl bg-slate-400`}>
        <View style={tw`bg-slate-400 flex-row justify-between items-center`}>
            <Text style={tw`text-black text-2xl`}>Transactions <Text style={tw`text-base`}>(mBTC)</Text></Text>
            <Pressable onPressIn={props.transactionsExpand}>
                <Icon name='resize' size={20} color='black' />
            </Pressable>
        </View>
    </View>
    <View style={tw`rounded-b-xl bg-slate-800 pb-2`}>
        {props.mempool_count ? <Text style={tw`text-yellow-200 py-2 italic text-center`}>{props.mempool_count} transaction(s) pending</Text> : null}
        {transactions.length > 0 ?
            transactions : <Text style={[ds.text, tw`text-slate-400 pt-2 italic text-center`]}>No transactions.</Text>}
        <View key={'ellipsis'} style={tw`items-center justify-center mt-2`}><Text style={tw`text-slate-400`}><Icon name='ellipsis-horizontal' size={20}/></Text></View>
    </View>
    </View>
}

export default class WalletViewScreen extends React.Component {
    wallet_pk = null
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
        loading: true, 
        error: false
    }
    constructor(props) {
        super(props)
        this.wallet_pk = props.route.params.wallet_pk
        console.log('[WalletViewScreen.constructor] '+this.wallet_pk)
    }
    componentWillUnmount() {
        console.log('[WalletViewScreen.componentWillUnmount]')
        clearInterval(this.fetch_stats_interval_handler)
    }
    componentDidMount() {
        Wallet.load(this.wallet_pk).then(wallet => {
            this.wallet = wallet
            // TODO: future might not be just PWPKH, could be P2SH P2PKH...
            this.addresses = this.wallet.getAllP2WPKH()
            // console.log(this.wallet.getTransactions(true)) // mempool TODO
            this.setState({loading: false, chain_balance: this.wallet.getBalance()});
            // first time force (will check stats, and mempool)
            // TODO: use cache for mempool so doesnt force that unless stats change...
            this.fetchStats(true)
            if(BLOCKAPI_ENABLED)
                this.fetch_stats_interval_handler = setInterval(
                    () => this.fetchStats(), 2000)
        }).catch(e => {
            console.log('[WalletViewScreen.componentDidMount] error loading this wallet: ', this.wallet_pk)
            console.error(e)
            this.setState({error: 'Couldn\'t load Wallet. Go back and try again.'})
        })
    }
    fetchStats(force=false) {
        // check last time fetch (to not overload server)
        if(!force && this.wallet.last_fetch > Date.now() - BLOCKAPI_TIMEOUT * 1000)
            return true
        console.log('[WalletViewScreen.fetchStats] wallet.last_fetch', 
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
            return <Error error={this.state.error} />
        if(this.state.loading)
            return <LoadingScreen />
        if(this.state.showReceive)
            return <View style={ds.mainContainerPt}>
                <WalletReceiveCard wallet={this.wallet}
                    exitReceive={() => this.setState({showReceive: false})} />
                <View style={{flex: 1}} />
                <View style={ds.buttonRow}>
                    <Pressable onPressOut={() => this.setState({showReceive: false})}>
                        <View style={[ds.button, tw`w-16`]}>
                            <Text style={ds.buttonText}>
                                <Icon name='arrow-back' size={24} />
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        if(this.state.showSend)
            return <WalletSendScreen wallet={this.wallet}
                exitSend={() => this.setState({showSend: false})}
                fetchStatsForced={() => this.fetchStats(true)} />
        return <View style={ds.mainContainerPtGradient}>
            <ScrollView style={ds.scrollViewGradient}>
                <WalletMainCard wallet={this.wallet}
                    chain_balance={this.state.chain_balance}
                    detailsToggle={() => this.setState({showDetails: !this.state.showDetails})}
                    showReceive={() => this.setState({showReceive: true})}
                    showSend={() => this.setState({showSend: true})}
                    showDetails={this.state.showDetails} />
                <WalletTransactions 
                    chain_count={this.state.chain_count} 
                    mempool_count={this.state.mempool_count}
                    txs={[...this.chain_txs, ...this.mempool]}
                    addresses={this.addresses} />
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

export {
    WalletMainCard,
    WalletTransactions,
    WalletReceiveCard,
}
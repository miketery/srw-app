import * as React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'

import { TEST } from '../../config'
import { BottomGradient, LoadingScreen, TopGradient } from '../../components'
import ds from '../../assets/styles'
import SI from '../../classes/SI'
import tw from '../../lib/tailwind'
import { WalletTypes } from '../../classes/Wallet'
import { WalletStates } from '../../classes/SmartWallet'

const WalletRow = (props) => {
    const { wallet, navigate } = props
    const isSmartWallet = wallet.wallet_type === WalletTypes.SMART
    const route = !isSmartWallet ? 'WalletViewRoute' : 
    wallet.wallet_state == WalletStates.INIT ? 'WalletCreateRoute' : 'SmartWalletViewRoute'
    return <Pressable key={wallet['pk']} style={ds.row} onPress={
        () => navigate(route, {wallet_pk: wallet['pk']})}>
        {!isSmartWallet || wallet.wallet_state == WalletStates.ACTIVE ? null : 
            wallet.wallet_state == WalletStates.INIT ? <Text style={tw`text-yellow-300 mr-1`}>[Draft]</Text> :
            wallet.wallet_state == WalletStates.PENDING ? <Text style={tw`text-green-400 mr-1`}>[Pending]</Text> : null}
        <Text style={{color: "white"}}>{wallet.name}</Text>
        <View style={tw`grow-1 flex-row items-center justify-end -my-2`}>
        {isSmartWallet ? 
            <Icon name="git-branch" size={24} color="white" /> : 
            <View style={tw`mr-2`}><Icon name="ellipse" size={10} color="white" /></View>}
        </View>
    </Pressable>
}

export default class WalletListScreen extends React.Component {
    vault = null
    wallets = []
    state = {loading: true,}
    constructor(props) {
        super(props)
        this.vault = props.vault
    }
    focus = () => {
        console.log('[WalletsListScreen.focus]')
        this.getItems()
    }
    componentDidMount() {
        console.log('[WalletsListScreen.componentDidMount]')
        this.focus()
        this.props.navigation.addListener('focus', this.focus)
    }
    getItems() {
        console.log('[WalletsListScreen.getItems]')
        Promise.all([
            SI.getAll('smart_wallets', this.vault.pk),
            SI.getAll('wallets', this.vault.pk),
        ]).then(arr => {
            console.log(arr.flat())
            this.wallets = arr.flat()
            this.wallets.sort((a, b) =>
                a['name'].toLowerCase() > b['name'].toLowerCase() ? 1 : -1)
            this.setState({loading: false})
        })
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        let rows = this.wallets.map(wallet => 
            <WalletRow
                key={wallet['pk']}
                wallet={wallet}
                navigate={this.props.navigation.navigate} />)
        return <View style={ds.mainContainerPtGradient}>
            <ScrollView style={ds.scrollViewGradient}>
                <Text style={ds.header}>Wallets</Text>
                <View style={ds.rows}>
                    {rows}
                </View>
                {rows.length == 0 ? <Text style={ds.text}>You have no wallets, add some.</Text>: null}
            </ScrollView>
            <TopGradient />
            <BottomGradient />
            <View style={ds.buttonRow}>
                <Text style={ds.text}>
                    {rows.length} wallets
                </Text>
                <Pressable onPress={() => this.props.navigation.navigate(
                    'WalletCreateRoute', {vault_pk: this.vault_pk})}
                    style={[ds.button, ds.blueButton]}>
                    <Text style={ds.buttonText}>Add Wallet</Text>
                </Pressable>
            </View>
        </View>
    }

}

const styles = StyleSheet.create({
})

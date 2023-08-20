import * as React from 'react'
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import { LoadingScreen } from '../../components'
import { Wallet } from '../../classes/Wallet'
import { primary_route } from '../LandingScreen'

export default class WalletDeleteScreen extends React.Component {
    wallet_pk = ''
    wallet = null
    state = {
        loading: true,
    }
    constructor(props) {
        super(props)
        this.wallet_pk = props.route.params.wallet_pk
    }
    componentDidMount() {
        Wallet.load(this.wallet_pk).then(wallet => {
            this.wallet = wallet
            console.log(this.wallet)
            this.setState({loading: false})
        })
    }
    finishSubmit() {
        console.log('[WalletDeleteScreen.finishSubmit] '+this.wallet.pk)
        const resetAction = CommonActions.reset(primary_route([{
            name: 'Wallets',
            state: {
                routes: [
                    {
                        name: 'WalletList',
                    }
                ]
            }
        }]))
        this.props.navigation.dispatch(resetAction)    
    }
    handleDelete = () => {
        console.log('WalletDeleteScreen.handleDelete')
        this.wallet.delete(() => this.finishSubmit()) 
    }
    cancelDelete() {
        this.props.navigation.goBack()
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        return <ScrollView style={ds.mainContainer}>
            <View style={tw`mb-2 ml-3`}>
                <Text style={ds.text}>Are you sure you want to delete this wallet?</Text>
            </View>
            <View style={tw`p-4 rounded-3xl bg-slate-700 mb-4`}>
                <View style={tw`mb-2`}>
                    <Text style={tw`text-slate-300 text-3xl`}>{this.wallet.name}</Text>
                </View>
                <View style={tw`mb-2`}>
                    <Text style={ds.textXs}>{this.wallet.verifyKeyBase58()}</Text>
                </View>
                <View>
                    <Text style={ds.text}>{this.wallet.notes || '[no notes]'}</Text>
                </View>
            </View>
            <View style={ds.buttonRow}>
                <Pressable onPress={() => this.handleDelete()}
                        style={[ds.button, ds.redButton]}>
                    <Text style={ds.buttonText}>Delete</Text>
                </Pressable>
                <Pressable onPress={() => this.cancelDelete()}
                        style={ds.button}>
                    <Text style={ds.buttonText}>Cancel</Text>
                </Pressable>
            </View>
        </ScrollView>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

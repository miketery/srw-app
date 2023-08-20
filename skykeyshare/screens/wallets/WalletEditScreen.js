import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import { LoadingScreen } from '../../components'

// import { WalletForm } from './WalletCreateScreen'
import Wallet from '../../classes/Wallet'
import ds from '../../assets/styles'

export default class WalletEditScreen extends React.Component {
    wallet_pk = ''
    wallet = null
    state = {
        name: '',
        notes: '',
        their_verify_key: '',
        loading: true,
    }
    constructor(props) {
        super(props)
        this.wallet_pk = props.route.params.wallet_pk
    }
    componentDidMount() {
        // Wallet.load(this.wallet_pk).then(wallet => {
        //     this.wallet = wallet
        //     console.log(this.wallet)
        //     this.setState({
        //         name: this.wallet.name,
        //         notes: this.wallet.notes,
        //         their_verify_key: this.wallet.verifyKeyBase58(),
        //         loading: false
        //     })
        // })
        this.setState({loading: false})
    }
    handleNameChange = (data) => {
        this.setState({name: data})
    }
    handleNotesChange = (data) => {
        this.setState({notes: data})
    }
    finishSubmit() {
        console.log('[WalletEditScreen.finishSubmit] '+this.wallet.pk)        
        const resetAction = CommonActions.reset({
            routes: [{
                name: 'MainHubRoute',
                params: {vault_pk: this.wallet.vault_pk},
                state: {
                    routes: [
                        {
                            name: 'WalletsRoute',
                            state: {
                                routes: [
                                    {
                                        name: 'WalletListRoute',
                                    },
                                    {
                                        name: 'WalletViewRoute',
                                        params: {wallet_pk: this.wallet.pk}
                                    }
                                ]
                            }
                        }
                    ]
                }
            }]
        })
        this.props.navigation.dispatch(resetAction)
    }
    handleSubmit = () => {
        console.log('[WalletEditScreen.handleSubmit]')
        this.wallet.update(this.state.name, this.state.notes)
        this.wallet.save(() => this.finishSubmit()) 
    }
    toDeleteScreen = () => {
        this.props.navigation.navigate('WalletDelete', {wallet_pk: this.wallet.pk})
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        return <View>
            <Text style={ds.text}>Edit Wallet</Text>
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

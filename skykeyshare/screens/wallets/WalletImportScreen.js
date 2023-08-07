import React from 'react'
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'

import base58 from 'bs58'
import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import Wallet, { WalletTypes } from '../../classes/Wallet'
import {Error, LoadingScreen, FieldError} from '../../components'
import { primary_route } from '../LandingScreen'


const STEPS ={
    NAME_AND_TYPE: 1,
    CONTACTS: 2,
    CONFIRM: 3
    // THRESHOLD: 3,
    // CONFIRM: 4, // TODO: this not needed can go straigh to SEND_SHARES
    // SEND_SHARES: 5,
    // SUCCESS: 6, //redirect to keyshare view from here after timeout
}

function NameAndType(props) {
    let isBasic = props.wallet_type == WalletTypes.BASIC
    let isSmart = props.wallet_type == WalletTypes.SMART
    return (<View>
        <View style={tw`mx-3 mb-5`}>
        </View>
        <View>
            <Text style={ds.label}>Name&nbsp;
            <Text style={ds.textSm}>(readable name for you)</Text></Text>
            <TextInput style={ds.input}
                onChangeText={props.handleNameChange}
                value={props.name} />
            <FieldError name='name' errors={props.errors} />

        </View>
        <View>
            <Text style={ds.label}>Type</Text>
            <View style={tw`flex flex-row`}>
                <Pressable style={[styles.radio, isBasic ? tw`bg-blue-800` : null]}
                    onPressOut={() => props.handleWalletTypeChange(WalletTypes.BASIC)}>
                    {isBasic ? 
                        <Icon name="checkmark-circle" color='yellow' size={24}></Icon> :
                        <Icon name="ellipse-outline" color='white' size={24}></Icon>}
                    <Text style={tw`ml-1 text-slate-200`}>Basic</Text>
                </Pressable>
                <Pressable style={[styles.radio, isSmart ? tw`bg-blue-800` : null]}
                    onPressOut={() => props.handleWalletTypeChange(WalletTypes.SMART)}>
                    {isSmart ? 
                        <Icon name="checkmark-circle" color='yellow' size={24}></Icon> :
                        <Icon name="ellipse-outline" color='white' size={24}></Icon>}
                    <Text style={tw`ml-1 text-slate-200`}>Social</Text>
                </Pressable>
            </View>
        </View>
        <View style={styles.nameContainer}>
            <Text style={ds.label}>Notes&nbsp;
                <Text style={ds.textSm}>(optional)</Text></Text>
            <TextInput style={[ds.input, styles.notesInput]} multiline={true}
                onChangeText={props.handleNotesChange}
                value={props.notes} />
        </View>
    </View>
    )
}
function Confirm(props) {
    return (<View>

    </View>)
}

function Flow(props) {
    switch (props.step) {
        case STEPS.NAME_AND_TYPE:
            return <NameAndType
                name={props.name}
                wallet_type={props.wallet_type}
                notes={props.notes}
                handleNameChange={props.handleNameChange}
                handleNotesChange={props.handleNotesChange}
                handleWalletTypeChange={props.handleWalletTypeChange}
                errors={props.errors}
                />
        case STEPS.CONFIRM:
            return <Confirm
                wallet={props.wallet}
                />
        default:
            return null
            break;
    }
}

export default class WalletCreateScreen extends React.Component {
    wallet = null
    vault = null
    state = {
        step: STEPS.NAME_AND_TYPE,
        name: '',
        wallet_type: WalletTypes.BASIC,
        notes: '',
        loading: true,
        error: null,
        errors: {}, // specific to individual fields
    }
    constructor(props) {
        super(props)
        // this.vault_pk = props.vault_pk ? props.vault_pk : props.route.params.vault_pk
        this.vault = props.vault
    }
    componentDidMount() {
        this.setState({loading: false})
    }
    handleNameChange = (data) => {
        this.setState({name: data})
    }
    handleWalletTypeChange = (data) => {
        this.setState({wallet_type: data})
    }
    handleNotesChange = (data) => {
        this.setState({notes: data})
    }
    setNameAndType = async () => {
        if(this.state.name.trim() == '') {
            this.setState({errors: {name: 'Name can\'t be empty'}})
            return
        }
        if(this.wallet == null) {
            this.wallet = await Wallet.create(this.vault, this.state.name,
                this.state.wallet_type, 'mainnet', this.state.notes)
        } else
            this.wallet.name = this.state.name
        this.wallet.step = this.wallet.wallet_type == WalletTypes.BASIC ?
            'CONFIRM' : 'CONTACTS' 
        this.wallet.save(() => {
            console.log('[WalletCreate.setNameAndType] saved')
            // this.setState({step: STEPS[this.wallet.step], errors: {}})
            this.finishSubmit()
        })
    }
    confirm = () => {

    }
    finishSubmit() { 
        console.log('[WalletCreateScreen.finishSubmit] '+ this.wallet.pk)
        const resetAction = CommonActions.reset(primary_route([
            {
                name: 'Wallets',
                state: {
                    routes: [
                        {
                            name: 'WalletList',
                        },
                        {
                            name: 'WalletView',
                            params: {wallet_pk: this.wallet.pk}
                        }
                    ]
                }
            }
        ]))
        this.props.navigation.dispatch(resetAction)
    }
    goBack = () => {
        if(this.state.step == 3 && this.wallet.wallet_type == WalletTypes.BASIC)
            this.setState({step: STEPS.NAME_AND_TYPE})
        if(this.state.step > 1)
            this.setState({step: 
                STEPS[Object.keys(STEPS).find(k => 
                    STEPS[k] == this.state.step - 1)]
            })
    }
    handleSubmit = () => {
        console.log('[WalletCreateScreen.handleSubmit]')
        switch (this.state.step) {
            case STEPS.NAME_AND_TYPE:
                this.setNameAndType() // name and type
                break;
            // step to add contacts / participants
            case STEPS.CONFIRM:
                this.confirm()
                break;
            default:
                break;
        }
    }
    render() {
        if(this.state.error) 
            return <Error error={this.state.error} />
        if(this.state.loading)
            return <LoadingScreen />
        return <View style={ds.mainContainer}>
            <Flow step={this.state.step}
                name={this.state.name}
                notes={this.state.notes}
                wallet_type={this.state.wallet_type}
                errors={this.state.errors}

                handleNameChange={this.handleNameChange}
                handleNotesChange={this.handleNotesChange}
                handleWalletTypeChange={this.handleWalletTypeChange}
            />
            <View style={{flex: 1}} />
            <View style={ds.buttonRow}>
                { ![STEPS.NAME_AND_TYPE, STEPS.SUCCESS].includes(this.state.step) ? 
                <Pressable onPressOut={this.goBack}
                        style={[ds.button]}>
                    <Text style={ds.buttonText}>Back</Text>
                </Pressable> : <View></View>}
                { this.state.step == STEPS.SUCCESS ? null :
                    <Pressable onPressOut={this.handleSubmit}
                            style={[ds.button, ds.greenButton]}>
                        <Text style={ds.buttonText}>
                            Next
                        </Text>
                    </Pressable>}
            </View>
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    notesInput: tw`text-lg h-50`,
    radio: tw`rounded-lg p-3 mb-2 bg-slate-700 w-30 flex-row items-center mr-4`,
})

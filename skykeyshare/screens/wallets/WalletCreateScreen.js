import React from 'react'
import { Text, View, Pressable, ScrollView } from 'react-native'
import { StackActions } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'
import base58 from 'bs58'

import { DEV, TEST } from '../../config'
import tw from '../../lib/tailwind'
import ds from '../../assets/styles'
import { primary_route } from '../LandingScreen'
import {ErrorScreen, LoadingScreen, FieldError,
    GoBackButton, TopGradient, BottomGradient} from '../../components'

import {CoinTypes, Wallet, WalletTypes, NetworkTypes} from '../../classes/Wallet'
import { StepsLine, 
    WalletNameAndNetwork,
    WalletTypeSelect,
    WalletTemplateSelect,
    WalletParticipantSelect,
    WalletMetaInputs,
    WalletConfirm } from './components'
import SmartWallet, { WalletStates} from '../../classes/SmartWallet'
import WalletTemplates, { WalletTemplateTypes } from '../../classes/WalletTemplates'
import Participant, {
    ParticipantStates,
    ParticipantRoles, } from '../../classes/Participant'

// Create a single wallet or a smart / shared wallet
// BTC, Determinstic from root seed
// Multi-sig HASH160 P2SH (P2WSH) for smart wallet (connect to conatcs)

const STEPS = {
    TYPE_SELECT: 1,
    NAME_AND_NETWORK: 2,
    TEMPLATE_SELECT: 3, // E.g. 2 of 3 multisig, etc.
    PARTICIPANTS: 4, // Contacts (Signers / Viewers), and public keys
    META_INPUTS: 5, // e.g. specify T (threshold) in T of N
    CONFIRM: 6,
    SUCCESS: 7,
}

function Confirm(props) {
    return (<View>

    </View>)
}

function Flow(props) {
    switch (props.step) {
        case STEPS.TYPE_SELECT:
            return <WalletTypeSelect setWalletType={props.setWalletType} />
        case STEPS.NAME_AND_NETWORK:
            return <WalletNameAndNetwork
                name={props.name}
                network={props.network}
                coin_type={props.coin_type}
                wallet_type={props.wallet_type}
                notes={props.notes}
                setNetwork={props.setNetwork}
                handleNameChange={props.handleNameChange}
                handleCoinTypeChange={props.handleCoinTypeChange}
                handleNotesChange={props.handleNotesChange}
                setCoinType={props.setCoinType}
                errors={props.errors}
                />
        case STEPS.TEMPLATE_SELECT:
            return <WalletTemplateSelect
                template={props.template}
                setTemplate={props.setTemplate} />
        case STEPS.PARTICIPANTS:
            return <WalletParticipantSelect
                vault={props.vault}
                wallet={props.wallet}
                contacts={props.contacts}
                navigation={props.navigation}
                setParticipants={props.setParticipants}
                errors={props.errors}
            />
        case STEPS.META_INPUTS:
            return <WalletMetaInputs
                wallet={props.wallet}
                meta_inputs={props.meta_inputs}
                handleMetaInputChange={props.handleMetaInputChange}
                errors={props.errors}
            />
        case STEPS.CONFIRM:
            return <WalletConfirm wallet={props.wallet} />
        case STEPS.SUCCESS:
            return <View />
        default:
            return null
            break;
    }
}
export default class WalletCreateScreen extends React.Component {
    state = {
        step: STEPS.TYPE_SELECT,
        wallet_type: WalletTypes.BASIC,
        name: '',
        network: TEST && DEV ? NetworkTypes.TESTNET : NetworkTypes.MAINNET,
        coin_type: CoinTypes.BTC,
        template: WalletTemplateTypes.BASIC_MULTISIG,
        notes: '',
        loading: true,
        error: null,
        errors: {}, // specific to individual fields
        meta_inputs: {},
    }
    wallet_pk = null
    wallet = null
    vault = null

    participants = []

    constructor(props) {
        console.log('[WalletCreateScreen.constructor]')
        super(props)
        this.vault = props.vault
        if(props.route.params !== undefined && 'wallet_pk' in props.route.params)
            this.wallet_pk = props.route.params.wallet_pk
    }
    componentDidMount() {
        console.log('[WalletCreateScreen.componentDidMount]', this.wallet_pk)
        if(this.wallet_pk !== null)
            Wallet.load(this.wallet_pk).then(wallet => {
                console.log(wallet)
                this.wallet = wallet
                this.setState({loading: false,
                    name: wallet.name,
                    network: wallet._network,
                    step: STEPS[wallet.step],
                    wallet_type: wallet.wallet_type,
                    meta_inputs: wallet.opts,
                })
            }).catch(e => {
                console.log('Error loading wallet', e)
                this.setState({error: 'Could not load wallet...'})
            })
        else
            this.setState({loading: false})
    }
    handleNameChange = (data) => {
        this.setState({name: data})
    }
    handleNotesChange = (data) => {
        this.setState({notes: data})
    }
    setWalletType = (type) => {
        console.log('[WalletCreateScreen.setWalletType]', type)
        this.setState({wallet_type: type, step: STEPS.NAME_AND_NETWORK})
    }
    setNetwork = (network) => {
        this.setState({network: network})
    }
    setCoinType = (data) => {
        this.setState({coin_type: data})
    }
    setNameAndNetwork = async () => {
        this.setState({loading: true}, async () => {
            if(this.state.name.trim() == '')
                return this.setState({errors: {name: 'Name can\'t be empty'}, loading: false})
            if(this.state.wallet_type == WalletTypes.BASIC) {
                // no steps in basic wallet (simply create and done)
                if(this.wallet == null)
                    this.wallet = await Wallet.create(this.vault, this.state.name,
                        this.state.wallet_type, this.state.network, this.state.notes)
                else
                    this.wallet.name = this.state.name
                this.wallet.save(() => {
                    console.log('[WalletCreate.setNameAndType] saved')
                    this.finishSubmit()
                })
            }
            else { // WalletTypes.SMART
                if(this.wallet == null)
                    this.wallet = SmartWallet.create(this.vault, this.state.name,
                        this.state.wallet_type, this.state.network,
                        this.state.coin_type, this.state.notes)
                else
                    this.wallet.name = this.state.name
                this.wallet.step = 'TEMPLATE_SELECT'
                this.wallet.save().then(() => {
                    this.setState({loading: false, step: STEPS.TEMPLATE_SELECT})
                }).catch(e => {
                    console.log('[WalletCreate.setNameAndType] error', e)
                    this.setState({error: 'Could not save Smart Wallet'})
                })
            }
        })
    }
    setTemplate = (template) => {
        if(WalletTemplates[template].enabled)
            this.setState({template: template})
    }
    confirmTemplate = () => {
        this.wallet._template = this.state.template
        this.wallet.step = 'PARTICIPANTS'
        this.wallet.save().then(() => {
            this.setState({step: STEPS.PARTICIPANTS})
        }).catch(e => {
            console.log('[WalletCreate.confirmTemplate] error', e)
            this.setState({error: 'Could not save Smart Wallet'})
        })
    }
    setParticipants = (participants) => {
        this.participants = participants.filter(p => p.role !== ParticipantRoles.OWNER)
    }
    confirmParticipants = () => {
        this.wallet.resetParticipants()
        // always add owner (myself...)
        this.wallet.addParticipant(new Participant(
            this.vault.verify_key, [], this.vault.my_name, ParticipantRoles.OWNER))
        // add selected (owner is excluded)
        console.log(this.participants)
        this.participants.forEach(p => {
            this.wallet.addParticipant(new Participant(
                base58.decode(p.verify_key), [], p.name, ParticipantRoles.SIGNER))
        })
        // check if count is within expected range
        // TODO should be in wallet class
        const lower =  WalletTemplates[this.state.template].participant_range[0]
        const upper =  WalletTemplates[this.state.template].participant_range[1]
        if(this.wallet.participants.length < lower || this.wallet.participants.length > upper) {
            this.setState({errors: {'participants': 'Invalid number of participants, required '+lower+'-'+upper+' including you.'}})
            return
        }
        this.wallet.step = 'META_INPUTS'
        this.wallet.save().then(() => {
            this.setState({step: STEPS.META_INPUTS})
        }).catch(e => {
            console.log('[WalletCreate.confirmParticipants] error', e)
            this.setState({error: 'Could not save Smart Wallet'})
        })
    }
    handleMetaInputChange = (user_input, data) => {
        if(user_input.type == 'number')
            data = String(data).replace(/[^\d]/g, '')
        this.setState({meta_inputs: {...this.state.meta_inputs, [user_input.name]: data}})
    }
    confirmMetaInputs = () => {
        // loop through and check inputs...
        const template = this.wallet.template
        let sanity = true // set to false if any error
        let errors = {}
        template.inputs.filter(i => i.user_input).forEach(input => {
            let out = input.errorChecking(
                this.state.meta_inputs,
                this.wallet.participants
                )
            console.log(out)
            if(out.length > 0) {
                errors[input.name] = out.join('. ')
                sanity = false
            }
        })
        this.setState({errors: errors})
        if(!sanity)
            return
        this.wallet.opts = this.state.meta_inputs
        this.wallet.step = 'CONFIRM'
        this.wallet.save().then(() => {
            this.setState({step: STEPS.CONFIRM})
        }).catch(e => {
            console.log('[WalletCreate.confirmMetaInputs] error', e)
            this.setState({error: 'Could not save Smart Wallet'})
        })
    }
    confirm = () => {
        // set state to PENDING
        this.wallet.wallet_state = WalletStates.PENDING
        this.wallet.save().then(() => {
            // send invites outs...
            // TODO
            this.finishSubmit()
        })
    }
    finishSubmit() { 
        console.log('[WalletCreateScreen.finishSubmit] '+ this.wallet.pk)
        const route = this.wallet.wallet_type == WalletTypes.BASIC ?
            'WalletViewRoute' : 'SmartWalletViewRoute'
        const replaceAction = StackActions.replace(
            route, {wallet_pk: this.wallet.pk})
        this.props.navigation.dispatch(replaceAction)
    }
    goBack = () => {
        const isBasic = this.state.wallet_type == WalletTypes.BASIC
        console.log(this.state.step)
        if(this.state.step > 2)
            this.setState({step: 
                STEPS[Object.keys(STEPS).find(k => 
                    STEPS[k] == this.state.step - 1)]
            })
        else if(this.state.step == 2 && isBasic)
            this.setState({step: STEPS.TYPE_SELECT})
        else
            this.props.navigation.navigate('WalletListRoute')
    }
    handleNext = () => {
        console.log('[WalletCreateScreen.handleNext]')
        switch (this.state.step) {
            case STEPS.TYPE_SELECT:
                this.setState({step: STEPS.NAME_AND_NETWORK})
            case STEPS.NAME_AND_NETWORK:
                this.setNameAndNetwork() // name and type
                break;
            case STEPS.TEMPLATE_SELECT:
                this.confirmTemplate()
                break;
            case STEPS.PARTICIPANTS:
                this.confirmParticipants()
                break;
            case STEPS.META_INPUTS:
                this.confirmMetaInputs()
                break;
            case STEPS.CONFIRM:
                this.confirm()
                break;
            default:
                break;
        }
    }
    render() {
        if(this.state.error) 
            return <ErrorScreen error={this.state.error} />
        if(this.state.loading)
            return <LoadingScreen />
        const isBasic = this.state.wallet_type == WalletTypes.BASIC
        const NEXT_BUTTON_MAP = {
            [STEPS.NAME_AND_NETWORK]: isBasic ? 'Create' : 'Next: Select Template',
            [STEPS.TEMPLATE_SELECT]: 'Next: Participants',
            [STEPS.PARTICIPANTS]: 'Next: Details',
            [STEPS.CONFIRM]: 'Create',
            [STEPS.SUCCESS]: 'View Wallet',
        }
        return <View style={ds.mainContainerPtGradient}>
            <ScrollView style={ds.scrollViewGradient}>
            {this.state.step > 0 && !isBasic ?
                <StepsLine current_step={this.state.step} total_steps={6}/> : null}
            <Flow step={this.state.step}
                vault={this.vault}
                wallet={this.wallet}
                wallet_type={this.state.wallet_type}
                name={this.state.name}
                network={this.state.network}
                coin_type={this.state.coin_type}
                notes={this.state.notes}
                template={this.state.template}

                setWalletType={this.setWalletType}
                setNetwork={this.setNetwork}
                setCoinType={this.setCoinType}
                handleNameChange={this.handleNameChange}
                handleNotesChange={this.handleNotesChange}
                setTemplate={this.setTemplate}
                setParticipants={this.setParticipants}
                handleMetaInputChange={this.handleMetaInputChange}
                meta_inputs={this.state.meta_inputs}
                errors={this.state.errors}
                navigation={this.props.navigation}
                />
            </ScrollView>
            <TopGradient />
            <BottomGradient />
            <View style={ds.buttonRow}>
                { ![STEPS.SUCCESS].includes(this.state.step) ? 
                <GoBackButton onPressOut={this.goBack} /> : <View></View>}
                { ![STEPS.SUCCESS, STEPS.TYPE_SELECT].includes(this.state.step) ? 
                <Pressable onPressOut={this.handleNext}
                    style={[ds.button, ds.greenButton, tw`w-60`]}>
                    <Text style={ds.buttonText}>
                        {NEXT_BUTTON_MAP[this.state.step] || 'Next'}
                    </Text>
                </Pressable> : null}
            </View>
        </View>
    }
}

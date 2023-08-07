import * as React from 'react'
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native'
import { StackActions } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'

import { Error, LoadingScreen, FieldError } from '../../components'
import base58 from 'bs58'

import SI from '../../classes/SI'
import tw from '../../lib/tailwind'
import ds from '../../assets/styles'
import { handleChange } from '../../lib/utils'

import {KeyShare, Guardian, Share, KEYSHARE_STATE} from '../../classes/KeyShare'
import GuardianScreen from './KeyShareGuardiansEdit';
import { TEST } from '../../config'
import { primary_route } from '../LandingScreen'
// Back up your X into shares.
// currently only seed, will be more though.


function NameScreen(props) {
    return (<View>
        <View style={tw`mx-3 mb-5`}>
            <Text style={ds.text}>
                Create a <b>Trusted Network Recovery Scheme</b> by 
                choosing Trusted Guardians and a Threshold.
                This will enable recovery of your Vault / Secret.<br /><br />
                Each Trusted Guardian will hold one or more <b>Shares</b>.

                Collecting sufficient Shares (specfieid by Threshold) 
                from Trusted Guardians will recover your Vault / Secret.
            </Text>
        </View>
        <View>
            <Text style={ds.label}>Name for Recovery Scheme</Text>
            <TextInput style={ds.input}
                onChangeText={props.handleNameChange}
                value={props.name}
                name='name' />
            <FieldError name='name' errors={props.errors} />
        </View>
    </View>)
}
function ThresholdScreen(props) {
    let contacts = props.keyshare.guardians.map((g, i) => 
        <View style={[ds.row, ds.rowSpaceBetween, tw`items-center`, tw`bg-blue-800`]}
                key={'g'+i}>
            <View>
                <Text style={ds.text}>{g.name}</Text>
            </View>
            <View style={tw`flex-row items-center`}>
                <Pressable onPressOut={() => g.removeShare() & props.updateShareCount()}>
                    <Icon name='remove-circle' color='white' size={24}></Icon>
                </Pressable>
                <View style={tw`w-10 text-center mb-1`}>
                    <Text style={ds.text2xl}>{g.share_count}</Text>
                </View>
                <Pressable onPressOut={() => g.addShare() & props.updateShareCount()}>
                    <Icon name='add-circle' color='white' size={24}></Icon>
                </Pressable>
            </View>
        </View>
    )
    return (<View>
        <View style={tw`mx-3 mb-5`}>
            <Text style={ds.text}>
                Choose how many shares are needed to recover your secret.
                Minimum is 2, otherwise you're simply sharing your secret directly.
                You can also adjust number of shares per guardian.
            </Text>
        </View>
        <View style={tw`flex flex-row justify-center mb-4`}>
            <View style={tw`items-center`}>
                <Text style={ds.textXl}>Threshold</Text>
                <TextInput style={[ds.input,tw`w-20 text-center`]}
                    onChangeText={props.handleThresholdChange}
                    keyboardType='number-pad'
                    value={props.threshold}
                    name='threshold' />
            </View>
            <View style={tw`justify-center mx-4 pt-4`}>
                <Text style={ds.textXl}>out of</Text>
            </View>
            <View style={tw`items-center`}>
                <Text style={ds.textXl}>Total Shares</Text>
                <Text style={[ds.text2xl, tw`mt-3`]}>{props.total_shares}</Text>
            </View>
        </View>
        <FieldError name='threshold' errors={props.errors} />
        <View>
            {contacts}
        </View>
    </View>)
}

export function Confirm(props) {
    let guardians = props.keyshare.guardians
    .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
    .map((g, i) => {
        return <View key={'g'+i} style={[ds.row, ds.rowSpaceBetween, tw`bg-blue-800 items-center`]}>
            <View style={tw`flex-row flex items-center`}>
                {!g.sent ? <Icon name="ellipse-outline" color='white' size={24}></Icon> :
                    props.step == 'final' && g.receipt ?  
                    <Icon name="checkmark-done-sharp" color='white' size={24}></Icon> :
                    <Icon name="send" color='white' size={22}></Icon>}
                {/* {props.step != 'final' ? null : g.receipt ? <Icon name="checkmark-circle" color='white' size={24}></Icon> :
                    <Icon name="ellipse-outline" color='white' size={24}></Icon>} */}
                <Text style={[ds.text, tw`ml-3`]}>{g.name}</Text>
            </View>
            <Text style={ds.textXl}>{g.share_count}</Text>
        </View>
    })
    return <View>
        <Text style={ds.text}>
            { props.step == STEPS.SEND_SHARES ? 
                'Click send to send shares.\nShares sent: '+props.sent_count+' of '+props.keyshare.shareCount() : 
                props.step == STEPS.CONFIRM ? 'Verify all details of your trusted recovery.': null}
        </Text>
        {'errors' in props ?
            <FieldError name='sent_count' errors={props.errors} /> : null}
        <View style={tw`mt-3`}>
            <Text style={ds.text}>Trusted Social Recovery Name</Text>
            <Text style={ds.text2xl}>{props.keyshare.name}</Text>
        </View>
        <View style={tw`mt-3`}>
            <Text style={[ds.textLg, tw`text-yellow-300`]}>
                Total Shares: {props.keyshare.shareCount()} <br />
                Shares need to Reocover: {props.keyshare.threshold}
            </Text>
        </View>
        <View style={tw`mt-3`}>
            <View style={ds.rowSpaceBetween}>
                <Text style={ds.textXl}>Guardians</Text>
                <Text style={ds.textXl}>Share Count</Text>
            </View>
            <View style={tw`mt-3`}>
                {guardians}
            </View>
        </View>
    </View>
}

const STEPS ={
    NAME: 1,
    GUARDIANS: 2,
    THRESHOLD: 3,
    CONFIRM: 4, // TODO: this not needed can go straigh to SEND_SHARES
    SEND_SHARES: 5,
    SUCCESS: 6, //redirect to keyshare view from here after timeout
}

function Flow(props) {
    switch (props.step) {
        case STEPS.NAME:
            return <NameScreen 
                name={props.name}
                notes={props.notes}
                errors={props.errors}
                handleNameChange={props.handleNameChange}
                handleNotesChange={props.handleNotesChange} />
        case STEPS.GUARDIANS:
            return <GuardianScreen
                contacts={props.contacts}
                keyshare={props.keyshare}
                errors={props.errors} />
        case STEPS.THRESHOLD:
            return <ThresholdScreen
                keyshare={props.keyshare}
                threshold={props.threshold}
                handleThresholdChange={props.handleThresholdChange}
                updateShareCount={props.updateShareCount}
                total_shares={props.total_shares}
                errors={props.errors}
                />
        case STEPS.CONFIRM:
            return <Confirm keyshare={props.keyshare}
                step={props.step}
                errors={props.errors}
                />
        case STEPS.SEND_SHARES:
            return <Confirm keyshare={props.keyshare}
                step={props.step}
                sent_count={props.sent_count}
                errors={props.errors}
                />
        case STEPS.SUCCESS:
            return <View>
                <Text style={ds.text3xl}>Success! All done.</Text>
                <Text style={ds.text}>Redirecting...</Text>
            </View>
        default:
            return null
            break;
    }
}

export default class KeyShareCreateScreen extends React.Component {
    state = {
        name: '',
        notes: '',
        threshold: 2,
        total_shares: 0,
        sent_count: 0,
        step: STEPS.NAME,
        loading_a: true,
        loading_b: true,
        loading_c: false, //for send shares
        error: null, //general error for whole flow
        errors: {}, // specific to individual fields
    }
    keyshare_pk = null
    keyshare = null
    contacts = []

    constructor(props) {
        console.log('[KeyShareCreate.constructor]')
        super(props)
        this.vault = props.vault
        if(props.route.params !== undefined && 'keyshare_pk' in props.route.params)
            this.keyshare_pk = props.route.params.keyshare_pk
    }
    componentDidMount() {
        console.log('[KeyShareCreate.componentDidMount]', this.keyshare_pk)
        if(this.keyshare_pk != null) {
            KeyShare.load(this.keyshare_pk).then(k => {
                this.keyshare = k
                let step = k.state == KEYSHARE_STATE.CONFIRMED ?
                    STEPS.SEND_SHARES : STEPS[k.step] 
                this.setState({name: k.name, 
                    notes: k.notes, 
                    loading_a: false,
                    step: step,
                    sent_count: k.sentCount()
                })
            }).catch(e => {
                console.log('Error keyshare load')
                console.error(e)
                this.setState({error: 'Couldnt find this keyshare'})
            })
        } else {
            this.setState({loading_a: false})
        }
        SI.getAll('contacts', this.vault.pk).then(contacts => {
            this.contacts = contacts
            this.contacts.sort((a, b) =>
                a['name'].toLowerCase() > b['name'].toLowerCase() ? 1 : -1)
            this.setState({loading_b: false})
        })
    }
    testing() {
        this.setState({loading_b: false, step: STEPS.NAME})
        return
        // this.keyshare = new KeyShare(this.vault, this.state.name)
        // for(let i = 0; i < 3; i++) {
        //     let g = new Guardian(this.contacts[i].name,
        //         base58.decode(this.contacts[i].their_verify_key),
        //         base58.decode(this.contacts[i].public_key))
        //     this.keyshare.addGuardian(g)
        // }
        // this.setState({loading: false, 
        //      step: 'confirm',
        //      total_shares: this.keyshare.shareCount()})
    }
    handleNameChange = (data) => this.setState({name: data})
    handleNotesChange = (data) => this.setState({notes: data})
    handleThresholdChange = (data) => {
        // only numbers
        this.setState({threshold: String(data).replace(/[^\d]/g, '')})
    }
    goBack = () => {
        if(this.state.step > 1)
            this.setState({step: 
                STEPS[Object.keys(STEPS).find(k => 
                    STEPS[k] == this.state.step - 1)]
            })
    }
    setName = () => {
        // initial submit
        // if name blank
        if(this.state.name.trim() == '') {
            this.setState({errors: {name: 'Name can\'t be empty'}})
            return
        }
        if(this.keyshare == null) {
            this.keyshare = KeyShare.create(this.vault,
                this.state.name, this.state.notes)
            this.keyshare.setPayload({type: 'seed', data: this.vault.words})
            }
        else
            this.keyshare.name = this.state.name
        this.keyshare.step = 'GUARDIANS'
        this.setState({step: STEPS[this.keyshare.step], errors: {}})
        this.keyshare.save(() => console.log('[KeyShareCreate.setName] saved'))
    }
    setGuardians = () => {
        // add guardians
        if(this.keyshare.guardianCount() < 2) {
            this.setState({errors: {guardians: 'Need atleast two (2) guardian'}})
            return
        }
        this.keyshare.step = 'THRESHOLD'
        this.setState({
            step: STEPS[this.keyshare.step], 
            total_shares: this.keyshare.shareCount(),
            errors: {}
        })
        this.keyshare.save(() => console.log('[KeyShareCreate.setGuardians] saved'))
    }
    updateShareCount = () => {
        // for updating view with new counts (passed as callback)
        let total_shares = this.keyshare.shareCount()
        this.setState({
            total_shares: total_shares,
            // threshold can't be above sharecount
            threshold: Math.min(this.state.threshold, this.keyshare.shareCount()) 
        })
    }
    setThreshold = () => {
        // shares and threshold
        try {
            this.keyshare.setThreshold(parseInt(this.state.threshold))
            this.keyshare.step = 'CONFIRM'
            this.keyshare.save(() => console.log('[KeyShareCreate.setThreshold] saved'))
            this.setState({step: STEPS[this.keyshare.step], errors: {}})
        } catch (error) {
            this.setState({errors: {threshold: error.message}})
        }
    }
    confirm = () => {
        this.keyshare.step = 'SEND_SHARES'
        this.keyshare.confirm().then(() => this.setState({step: STEPS[this.keyshare.step]}))
    }
    sendShares = () => {
        this.keyshare.sendShares(this.vault).then(arr => {
            this.setState({sent_count: this.keyshare.sentCount()})
            let state_sent = this.keyshare.guardianCount() == this.keyshare.sentCount()
            if(state_sent)
                this.keyshare.state = KEYSHARE_STATE.SENT
            this.keyshare.save(() => {
                console.log('[KeyShareCreate.sendShares] save')
                if(state_sent) {
                    setTimeout(() => this.setState({
                        step: STEPS.SUCCESS,
                        errors: {}}), 500)
                    setTimeout(() => {
                        const replaceAction = StackActions.replace('KeyShareViewRoute', {keyshare_pk: this.keyshare.pk})
                        this.props.navigation.dispatch(replaceAction)
                    }, 1500)
                }
                else {
                    this.setState({errors: {
                        sent_count: 'Not all sent, try again, or come back later'
                    }, loading_c: false})
                }
            })
        }).catch(e => {
            console.error(e)
            this.setState({error: e})
        })
    }
    handleSubmit = () => {
        switch (this.state.step) {
            case STEPS.NAME:
                this.setName() // name
                break;
            case STEPS.GUARDIANS:
                this.setGuardians() // guardians select
                break;
            case STEPS.THRESHOLD:
                this.setThreshold() // shares counts and threshold
                break;
            case STEPS.CONFIRM:
                this.confirm()
                break;
            case STEPS.SEND_SHARES:
                this.sendShares()
                break;
            default:
                break;
        }
    }
    render() {
        if(this.state.error) 
            return <Error error={this.state.error} />
        if(this.state.loading_a || this.state.loading_b)
            return <LoadingScreen />
        return <View style={ds.mainContainer}>
            <Flow 
                vault={this.vault}
                contacts={this.contacts}
                keyshare={this.keyshare}
                step={this.state.step}
                name={this.state.name}
                notes={this.state.notes}
                threshold={this.state.threshold}
                total_shares={this.state.total_shares}
                sent_count={this.state.sent_count}
                errors={this.state.errors}
                handleNameChange={this.handleNameChange}
                handleNotesChange={this.handleNotesChange}
                handleThresholdChange={this.handleThresholdChange}
                updateShareCount={this.updateShareCount} />
            <View style={{flex: 1}} />
            <View style={ds.buttonRow}>
                { ![STEPS.NAME, STEPS.SEND_SHARES, STEPS.SUCCESS].includes(this.state.step) ? 
                <Pressable onPressOut={this.goBack}
                        style={[ds.button]}>
                    <Text style={ds.buttonText}>Back</Text>
                </Pressable> : <View></View>}
                { this.state.step == STEPS.SUCCESS ? null :
                    this.state.loading_c ? 
                        <View style={[ds.button, ds.greyButton]}>
                            <Text style={ds.buttonText}>Loading</Text></View> :
                        <Pressable onPressOut={this.handleSubmit}
                                style={[ds.button, ds.greenButton]}>
                            <Text style={ds.buttonText}>
                                {this.state.step == STEPS.CONFIRM ? 'Confirm' : 
                                    this.state.step == STEPS.SEND_SHARES ? 'Send Shares' : 'Next'}
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
})

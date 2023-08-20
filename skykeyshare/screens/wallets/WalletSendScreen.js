import * as React from 'react'
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

const bitcoin = require('bitcoinjs-lib')

import { LoadingScreen, FieldError } from '../../components'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'
import { satsToMBTCStr } from '../../classes/Wallet'
import { bytesToHex } from '../../lib/utils'
import { fees, transactions } from '../../lib/esplora'

const CHAR_WIDTH = 18
// TODO fetch BTC price
const satsToUSD = (sats, price=21234) => (price * (sats || 0) / 10**8).toFixed(2)

const AmountInput = (props) => {
    return <View>
    <Text style={ds.label}>Amount</Text>
    <View style={tw`flex flex-col items-center px-1`}>
        <TextInput 
            onChangeText={props.handleAmountChange}
            placeholder={'0'}
            disabled={props.disabled}
            style={[ds.input,
                tw`font-bold font-mono text-3xl text-blue-400 focus:outline-none active:outline-none text-center pt-2 pb-6 -mb-8 w-full`,
                props.disabled ? tw`border-slate-700` : null,
            ]}
            value={props.amount}/>
        <Text style={tw`text-blue-400 text-lg font-bold font-mono`}>mBTC</Text>
        <View style={tw`mt-2`}>
            <Text style={[ds.text, tw`italic`]}>
                {/* {props.sats} */}
                USD: ${satsToUSD(props.sats)}
            </Text>
        </View>
    </View>
    <FieldError name='amount' errors={props.errors} />
    </View>
}
const AddressInput = (props) => {
    return <View style={tw`mt-2`}>
    <Text style={ds.label}>Destination Address</Text>
    <TextInput multiline 
        onChangeText={props.handleAddressChange}
        disabled={props.disabled}
        style={[ds.input,
            tw`text-base text-blue-400 font-mono`,
            props.disabled ? tw`border-slate-700` : null,
            {height: 80}
        ]} 
        value={props.address} />
    <FieldError name='address' errors={props.errors} />
</View>
}
const BLOCK_CONFIRMATION_TARGET = [
    [1, '10m'],
    [3, '30m'],
    [6, '1h'],
    [12, '2h'],
    [24, '4h'],
    [144, '1d']
]
const FeeInput = (props) => {
    const radios = BLOCK_CONFIRMATION_TARGET.map(target => {
        return <Pressable style={tw`items-center w-10`} key={target[0]}
                onPress={() => props.setBlockTarget(target[0])}>
            <Text style={ds.textSm}>
                {target[1]}
            </Text>
            {props.block_target == target[0] ?
            <Text style={tw`text-blue-300`}>
                <Icon name="checkmark-circle" size={28}></Icon>
            </Text> :
            <Text style={props.disabled ? tw`text-slate-500` : tw`text-slate-200`}>
                <Icon name="ellipse-outline" size={28}></Icon>
            </Text>
            }
            <Text style={ds.textXs}>
                {(Math.round(props.feeRates[target[0]]*10)/10).toFixed(1)}
            </Text>
        </Pressable>
    })
    const smallInputStyle = [ds.input, tw`text-lg text-blue-400 font-mono text-right py-1 mb-0 grow-0 w-4/5`]
    return <View style={tw`mt-2`}>
        <View style={tw`flex flex-row`}>
            <Text style={[ds.label, tw`w-1/2`]}>Fee</Text>
            {props.customFee ? <Text style={[ds.label, tw`ml-0`]}>Fee Rate</Text> : null}
        </View>
        {props.customFee ? 
        <View style={[tw`flex flex-row justify-between`, {height: 68}]}>
            <View style={tw`w-1/2 flex flex-row items-center pr-1`}>
                <TextInput style={[...smallInputStyle, tw`pr-10 -mr-10`]}
                    value={props.fee} onChangeText={props.handleFeeChange} />
                <Text style={tw`text-sm text-blue-400`}>sats</Text>
            </View>
            <View style={tw`w-1/2 flex flex-row items-center pl-1`}>
                <TextInput style={[...smallInputStyle, tw`pr-14 -mr-14 border-slate-700`]}
                    value={(props.disabled ? '' : '~') + (props.fee / props.size).toFixed(1)} disabled />
                <Text style={tw`text-sm text-blue-400`}>sats/vB</Text>
            </View>
        </View>:
        <View style={tw`flex flex-row justify-between`}>    
            {radios}
        </View>}
        <View style={tw`flex flex-row justify-between items-center mt-2 mx-1`}>
            <View>
                {props.disabled ? null :
                <Pressable style={[ds.buttonXs, props.customFee ? null : ds.blueButton, tw`py-1`]}
                    onPress={props.toggleCustomFee}
                >
                    <Text style={ds.textXs}>{props.customFee ? 'Simple' : 'Custom'}</Text>
                </Pressable>}
            </View>
            <View style={tw`my-2`}>
                <Text style={ds.text}>{props.customFee ? 'Custom: ' : props.disabled ? 'Fee: ' : 'Estimated: '}<Text style={tw`text-blue-400 font-mono`}>{props.fee}sats</Text> (${satsToUSD(props.fee)})</Text>
            </View>
        </View>
    </View>
}
const DescriptionInput = (props) => {
    return <View style={tw`mt-4`}>
    <Text style={ds.label}>Description <Text style={ds.textXs}>(optional, max 200 characters)</Text></Text>
    <TextInput multiline style={[ds.input, tw`text-base font-mono`, {height: 80}]}></TextInput>
    <FieldError name='description' errors={props.errors} />
</View>
}

export default class WalletSendScreen extends React.Component {
    state = {
        loading: true,
        isReadyToTransmit: false,
        sending: false, // for sending animation
        success: false, // done
        error: false, // something went wrong...
        amount: '', // mBTC for string input view
        address: '', //tb1q6spk3qceyc3hdsz4cxe8ml6ka2gtfa9fauzdsj',
        customFee: false,
        block_target: 3, // will choose block_rate if not custom
        fee: 1500, // will choose fee if is custom
        //
        sats: 0, // sats - the number to be used in the transaction
        size: null, // set when transaction is built
        amountUSD: 0, // for display
        errors: {amount: '', address: '', balance: ''},
    }
    feeRates = {}
    balance = 0 // sats
    wallet = null
    utxo = []
    psbt = null
    final_tx = null

    constructor(props) {
        super(props)
        this.wallet = props.wallet
        this.balance = props.wallet.getBalance() // sats
    }
    componentDidMount() {
        Promise.all([this.getFees(), this.getUTXO()]).then(() => {
            this.estimateFee()
            this.setState({loading: false})
        })
    }
    getFees = async () => {
        this.feeRates = await fees.getFeeEstimates('mainnet') //this.wallet.network)
    }
    getUTXO = async () => {
        this.utxo = await this.wallet.fetchUTXO()
        return this.utxo
    }
    estimateFee = () => {
        const rate = this.feeRates[this.state.block_target]
        const size = this.state.size || this.utxo.length * 50 + 100
        this.setState({fee: Math.ceil(size * rate), size: size})
    }
    handleAmountChange = (amount) => {
        let y = String(amount).replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
        if(y.includes('.')) // if more than 5 decimal digits cut it.
            y = y.split('.')[1].length > 5 ? y.slice(0, y.length + 5 - y.split('.')[1].length) : y
        let x = parseInt(y.split('.')[0]) * 10**5 || 0 // mBTC to sats
        if(y.includes('.'))
            x += parseInt(y.split('.')[1] + '0'.repeat(5 - y.split('.')[1].length)) || 0
        this.setState({
            amount: y, // for user input in mBTC
            sats: x, // for value in PSBT tx
        })
    }
    handleAddressChange = (address) => {
        this.setState({address: address})
    }
    handleBlockTargetChange = (target) => {
        if(this.state.isReadyToTransmit)
            return
        this.setState({block_target: target}, () => 
            this.estimateFee()
        )
    }
    customFeeToggle = () => {
        if(this.state.isReadyToTransmit)
            return
        if(this.state.customFee) // going back to not custom
            this.handleBlockTargetChange(this.state.block_target)
        this.setState({customFee: !this.state.customFee, isReadyToTransmit: false})
    }
    handleFeeChange = (sats) => {
        const fee = parseInt(String(sats).replace(/[^\d]/g, '')) || 0
        const rate = (fee / this.state.size).toFixed(1)
        this.setState({fee: fee, feeRate: rate})
    }
    verifyAmount = () => {
        this.balance = this.wallet.getBalance()
        if(this.state.sats == 0 ) {
            throw('Amount can\'t be 0')
        } else if(this.state.sats > this.balance) {
            throw('Amount greater than balance of '+satsToMBTCStr(this.balance))
        } else if(this.state.sats + this.state.fee > this.balance) {
            throw('Amount and fee of '+satsToMBTCStr(this.state.sats + this.state.fee) + 
                ' is greater than balance of '+satsToMBTCStr(this.balance))
        } 
        return true
    }
    verifyAddress = () => {
        return bitcoin.address.toOutputScript(
            this.state.address, this.wallet.network
        )
    }
    createTransaction = async () => {
        // check if sane, set state to isReadyToCommit
        let sanity = true // set to false if cant proceed
        let output_script = null
        let change_output_script = null
        // verify amount
        try {
            this.verifyAmount()
            this.setState({errors: {...this.state.errors, amount: ''}})
        } catch(e) {
            sanity = false
            this.setState({errors: {...this.state.errors, amount: e}})
        }
        // verify address
        try {
            output_script = this.verifyAddress()
            this.setState({errors: {...this.state.errors, address: ''}})
        } catch(e) {
            sanity = false
            this.setState({errors: {...this.state.errors, address: 'Address invalid.'}})
        }
        // if amount or address errors then dont continue
        if(!sanity)
            return
        //BUILD PSBT
        try {
            let sum = this.utxo.reduce((s, tx) => s + tx.value, 0)
            if(sum != this.balance) {
                throw('Balance out of sync, try again later...')
            }
            let runs = 0
            let fee = this.state.fee
            do { // potentially run twice - first to get size estimate (unless custom fee)
                this.psbt = new bitcoin.Psbt({network: this.wallet.network})
                this.utxo.map((input, i) => {
                    console.log(i, input.txid, input.vout, input)
                    this.psbt.addInput({
                        hash: input.txid,
                        index: input.vout,
                        witnessUtxo: {script: input.output, value: input.value }
                    })
                })
                const change = sum - this.state.sats - fee
                console.log(sum, this.state.sats, fee, change)
                change_output_script = bitcoin.address.toOutputScript(
                    this.wallet.getAllP2WPKH()[0], this.wallet.network
                )
                this.psbt.addOutput({script: output_script, value: this.state.sats})
                this.psbt.addOutput({script: change_output_script, value: change})
                // this.psbt.signInput(0, this.wallet.receive_nodes[0].node)
                this.psbt.signAllInputs(this.wallet.receive_nodes[0].node)
                this.psbt.finalizeAllInputs()
                // console.log(this.psbt.getFeeRate())
                // console.log(this.psbt.getFee())
                this.final_tx = this.psbt.extractTransaction()
                let size = this.final_tx.virtualSize()
                if(runs == 0)
                    this.setState({size: size})
                if(!this.state.customFee) {
                    // since not a custom fee, we'll set fee given 
                    fee = Math.ceil(this.feeRates[this.state.block_target] * size)
                    this.setState({fee: fee})
                }
                runs += 1
            } while(!this.state.customFee && runs < 2)
        } catch(e) {
            console.log(e)
        }
        if(sanity)
            this.setState({isReadyToTransmit: true})
    }
    transmitTransaction = async () => {
        console.log('[WalletSendScreen.transmitTransaction]')
        this.setState({sending: true}, async () => {
            const result = await transactions.postTx(this.final_tx.toHex(), this.wallet.network)
            if(result.length != '64') { //txid
                this.setState({error: 'Something went wrong... try again later. Or check transactions to see if was registered my network.'})
                return
            }
            console.log('[WalletSendScreen.transmitTransaction]', result)
            this.setState({success: result})
        })
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        if(this.state.sending)
            return <View style={ds.mainContainerPt}>
                <View style={tw`px-4 py-2 rounded-t-xl bg-slate-400`}>
                    <View style={tw`bg-slate-400 flex-row justify-between`}>
                        <Text style={tw`text-black text-2xl`}>Send</Text>
                    </View>
                </View>
                <View style={tw`px-4 rounded-b-xl bg-slate-700 mb-4 py-4 flex flex-col pb-16 h-80 justify-center`}>
                {this.state.success == false ? 
                    <Text style={ds.textLg}>{this.state.error ? this.state.error : 'Sending...'}</Text> :
                    <View>
                        <Text style={ds.textLg}>Success! Transaction ID:</Text>
                        <Text style={tw`text-slate-200 font-mono my-3`}>{this.state.success}</Text>
                        <Pressable style={[ds.button, ds.blueButton]} onPress={() => [this.props.fetchStatsForced(), this.props.exitSend()]}>
                            <Text style={ds.buttonText}>Back to Wallet</Text>
                        </Pressable>
                    </View>}
                </View>
            </View>
        return <View style={ds.mainContainerPt}>
        <ScrollView style={tw``}>
        <View style={tw`px-4 py-2 rounded-t-xl bg-slate-400`}>
            <View style={tw`bg-slate-400 flex-row justify-between items-center`}>
                <Text style={tw`text-black text-2xl`}>Send</Text>
                <Pressable onPressIn={this.props.exitSend}>
                    <Icon name='close-outline' size={24} color='black' />
                </Pressable>
            </View>
        </View>
        <View style={tw`px-4 rounded-b-xl bg-slate-700 mb-4 py-4 flex flex-col`}>
            <AmountInput 
                amount={this.state.amount}
                sats={this.state.sats}
                handleAmountChange={this.handleAmountChange}
                disabled={this.state.isReadyToTransmit}
                errors={this.state.errors}
                />
            <AddressInput
                address={this.state.address}
                handleAddressChange={this.handleAddressChange}
                disabled={this.state.isReadyToTransmit}
                errors={this.state.errors} />
            <FeeInput
                feeRates={this.feeRates}
                customFee={this.state.customFee}
                fee={this.state.fee}
                block_target={this.state.block_target}
                size={this.state.size}
                disabled={this.state.isReadyToTransmit}
                setBlockTarget={this.handleBlockTargetChange}
                handleFeeChange={this.handleFeeChange}
                toggleCustomFee={this.customFeeToggle}
                />
            {/* <DescriptionInput errors={this.state.errors} /> */}
            { this.state.isReadyToTransmit ? 
            <View style={tw`flex flex-col items-center mt-1 pt-1 border-t-2`}>
                <View style={tw`flex flex-row mb-1`}>
                    <Text style={ds.textLg}>Total: </Text>
                    <View>
                        <Text style={tw`text-lg text-blue-400`}>
                            {satsToMBTCStr(this.state.sats+this.state.fee)}
                        </Text>
                        <Text style={ds.text}>
                            (${satsToUSD(this.state.sats+this.state.fee)})
                        </Text>
                    </View>
                </View>
                <Pressable style={[ds.button, ds.greenButton]}
                    onLongPress={this.transmitTransaction}>
                    <Text style={ds.buttonText}>Send</Text>
                </Pressable>
                <Text style={[ds.textSm, tw`mt-2 italic`]}>Hold. No going back.</Text>
            </View>
            : null}
        </View>
        <View style={{flex: 1}} />
        </ScrollView>
        <View style={ds.buttonRow}>
            { this.state.isReadyToTransmit ? <View />:
            <Pressable onPressOut={this.props.exitSend}>
                <View style={[ds.button, tw`w-16`]}>
                    <Text style={ds.buttonText}>
                        <Icon name='arrow-back' size={24} />
                    </Text>
                </View>
            </Pressable>
            }
            { this.state.isReadyToTransmit ? 
            <Pressable onPressIn={() => this.setState({isReadyToTransmit: false})}>
                <View style={[ds.button]}>
                    <Text style={ds.buttonText}>Edit</Text>
                </View>
            </Pressable> :
            <Pressable onPressIn={this.createTransaction}>
                <View style={[ds.button, ds.blueButton]}>
                    <Text style={ds.buttonText}>Review</Text>
                </View>
            </Pressable>}
        </View>
        </View>
    }
}

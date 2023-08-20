import React from 'react'
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../../../assets/styles'
import tw from '../../../lib/tailwind'

import { FieldError } from '../../../components'

import { NetworkTypes, CoinTypes } from '../../../classes/Wallet'

export function WalletNameAndNetwork(props) {
    let isBTC = props.coin_type == CoinTypes.BTC
    let isTestnet = props.network == NetworkTypes.TESTNET
    let isMainnet = props.network == NetworkTypes.MAINNET
    const [advanced, setAdvanced] = React.useState(true)
    return (<View style={tw`grow-1`}>
        {/* <View style={tw`h-10`}>
            <Text style={ds.header}>&nbsp;</Text>
        </View> */}
        <View>
            <Text style={ds.label}>Wallet Name&nbsp;
            <Text style={ds.textSm}>(readable name for you)</Text></Text>
            <TextInput style={ds.input}
                onChangeText={props.handleNameChange}
                value={props.name} />
            <FieldError name='name' errors={props.errors} />
        </View>
        <View style={tw`items-end`}>
            <Pressable onPress={() => setAdvanced(!advanced)}>
                <View><Text style={tw`text-blue-400`}>Advanced?</Text></View>
            </Pressable>
        </View>
        { advanced ? <View>
        <View style={tw`my-2`}>
            <View style={tw`flex-row items-center`}>
                <Text style={tw`text-slate-300 text-lg mr-4`}>Network</Text>
                <Pressable style={styles.radioA}
                    onPressOut={() => props.setNetwork(NetworkTypes.MAINNET)}>
                    <Text style={isMainnet ? tw`text-blue-400` : tw`text-slate-200`}>
                        <Icon name={isMainnet ? "checkmark-circle" : "ellipse-outline" } size={24} />
                    </Text>
                    <Text style={tw`ml-1 text-slate-200`}>Mainnet</Text>
                </Pressable>
                <Pressable style={styles.radioA}
                    onPressOut={() => props.setNetwork(NetworkTypes.TESTNET)}>
                    <Text style={isTestnet ? tw`text-blue-400` : tw`text-slate-200`}>
                        <Icon name={isTestnet ? "checkmark-circle" : "ellipse-outline"} size={24} />
                    </Text>
                    <Text style={tw`ml-1 text-slate-200`}>Testnet</Text>
                </Pressable>
            </View>
        </View>
        {/* <View style={tw`my-2`}>
            <Text style={ds.label}>Currency</Text>
            <View style={tw`flex flex-row`}>
                <Pressable style={[styles.radioB, isBTC ? tw`bg-blue-800` : null]}
                    onPressOut={() => props.handleCoinTypeChange(CoinTypes.BTC)}>
                        <Text style={isBTC ? {color: 'yellow'} : tw`text-slate-200`}>
                            <Icon name="logo-bitcoin" size={30} />
                        </Text>
                        <Text style={ds.textLg}>BTC</Text>
                        <Text style={ds.textXs}>Bitcoin</Text>
                </Pressable>
            </View>
            <Text style={[ds.textXs, tw`mt-1 italic`]}>Only Bitcoin at the moment.</Text>
        </View> */}
        </View> : null}
        {/* <View style={styles.nameContainer}>
            <Text style={ds.label}>Notes&nbsp;
                <Text style={ds.textSm}>(optional)</Text></Text>
            <TextInput style={[ds.input, styles.notesInput]} multiline={true}
                onChangeText={props.handleNotesChange}
                value={props.notes} />
        </View> */}
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    notesInput: tw`text-lg h-50`,
    radioA: tw`w-30 items-center p-2 flex-row`, //tw`rounded-lg p-2 bg-slate-700 w-30 flex-row items-center mr-3`,
    radioB: tw`rounded-lg p-2 bg-slate-700 w-20 flex-col items-center mr-3`,
})
    
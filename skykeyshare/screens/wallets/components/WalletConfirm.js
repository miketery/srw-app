import React from 'react'
import { Text, View, Pressable, ScrollView, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'


import tw from '../../../lib/tailwind'
import ds from '../../../assets/styles'
import { FieldError } from '../../../components'
import { ParticipantRoles } from '../../../classes/Participant'

const row = tw`mb-2`
const param = tw`p-2 border-slate-400 border-l-4 bg-slate-800 text-lg text-slate-200`

export const WalletConfirm = (props) => {
    const wallet = props.wallet
    // Name and Network
    // Template
    // Participants
    // Details
    return <View>
    <View><Text style={ds.label}>Confirm Details</Text></View>
    <View style={tw`px-4 py-2 rounded-t-xl bg-slate-400`}>
        <View style={tw`bg-slate-400 flex-row justify-between items-center`}>
            <Text style={tw`text-black text-2xl`}>{wallet.name}</Text>
        </View>
    </View>
    <View style={tw`rounded-b-xl bg-slate-700 mb-4 px-4 py-2 pb-6`}>
        <View style={row}>
            <Text style={ds.textLg}>Network</Text>
            <Text style={param}>
                {wallet.coin_type} {wallet._network}</Text>
        </View>
        <View style={row}>
            <Text style={ds.textLg}>Template</Text>
            <Text style={param}>
                {wallet.template.display.replace('\n', ' ')}</Text>
            <Text style={[param, tw`text-sm`]}>
                {wallet.template.description}
            </Text>
        </View>
        <View style={row}>
            <Text style={ds.textLg}>Parameters</Text>
            {wallet.template.inputs.filter(i => i.user_input).map((input, index) => <View key={index}>
                <Text style={[param, tw`text-base`]}>{input.display}: {wallet.opts[input.name]}</Text>
            </View>)}
        </View>
        <View>
            <Text style={ds.textLg}>Participants</Text>
            {wallet.participants.map((p, index) => 
                <View style={[param, tw`py-1 items-center flex-row`]} key={index}>
                    <Text style={[ds.text, tw`mr-2`]}>
                        <Icon name='person-outline' size={16} />
                    </Text>
                    <Text style={ds.text}>
                        {p.name} {p.role == ParticipantRoles.OWNER ? <Text style={tw`font-mono`}>{'<you>'}</Text> : null}
                    </Text>
                </View>)}
        </View>
    </View>
    </View>
}
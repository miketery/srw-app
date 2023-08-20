import React from 'react'
import { Text, View, ScrollView, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../../../lib/tailwind'
import ds from '../../../assets/styles'

import WalletTemplates from "../../../classes/WalletTemplates"
import { Info, Loading } from '../../../components'

const cardStyle = tw`p-4 rounded-lg mb-5 flex-col`

function Card(props) {
    const t = props.template
    const isSelected = props.selected
    return <Pressable onPress={() => props.setTemplate(t.name)}>
    <View style={[cardStyle, isSelected ? tw`bg-blue-800` : tw`bg-slate-700`]}>
        <View style={tw`flex-row items-center justify-center mb-3`}>
            <View style={tw`w-1/5 items-start justify-start`}>
                {isSelected ?
                <Icon name='checkmark' color='yellow' size={30} /> : null}
                {!t.enabled ? 
                <Icon name='remove-circle-outline' size={30} color='rgb(148, 163, 184)' />
                : null}
            </View>
            <View style={tw`w-4/5 justify-end`}>
                <Text style={[ds.textLg, tw`text-right`, !t.enabled ? tw`text-slate-400` : null]}>{t.display}</Text>
            </View>
        </View>
        <View style={tw`w-full mb-3`}>
            <Text style={[ds.textXs, !t.enabled ? tw`text-slate-400` : null]}>{t.description}</Text>
        </View>
        <View style={tw`bg-slate-800 p-2 rounded-md border-slate-500 border`}>
            <Text style={[tw`text-xs font-mono`, !t.enabled ? tw`text-slate-400` : tw`text-slate-200`]}>{t.logic}</Text>
        </View>
    </View>
    </Pressable>
}

export function WalletTemplateSelect(props) {
    const templates = Object.values(WalletTemplates).filter(t => !('disabled' in t || t.disabled))
    const selected_name = WalletTemplates[props.template].display
    const cards = templates.map((template, index) =>
        <Card key={index}
            template={template}
            selected={props.template == template.name}
            setTemplate={props.setTemplate}
        />
    )
    return <View style={tw``}>
        <View>
            <Text style={[ds.label, tw`-mb-2`]}>Choose a Template</Text>
        </View>
        <Info t='Only T of N Multisig available, more options to be enabled soon.' />
        {cards}
    </View>
}

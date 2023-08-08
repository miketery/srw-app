import { Text, View, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../lib/tailwind'
import ds from '../assets/styles'

export const TopCard = (props) => {
    return <View style={tw`px-4 py-2 rounded-t-xl bg-slate-400`}>
    <View style={tw`bg-slate-400 flex-row justify-start items-center`}>
        {'icon' in props? 
        <Text style={tw`text-black mr-3`}>
            <Icon name={props.icon} size={29} />
        </Text> : null}
        <Text style={tw`text-black text-2xl`}>{props.label}</Text>
        { 'details' in props ? 
        <Pressable onPressIn={() => props.detailsToggle()}>
            <Icon name='ellipsis-vertical' size={20} color='black' />
        </Pressable> : null}
    </View>
</View>
}

export const BottomCard = (props) => {
    return <View style={tw`px-4 rounded-b-xl bg-slate-800 mb-4 pt-4 pb-4`}>
        {props.children}
    </View>
}

export const Card = (props) => {
    return <View style={tw`my-2`}>
        <TopCard {...props} />
        <BottomCard {...props} />
    </View>
}

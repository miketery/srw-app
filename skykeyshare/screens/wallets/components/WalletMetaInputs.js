import React from 'react'
import { Text, View, Pressable, ScrollView, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'


import tw from '../../../lib/tailwind'
import ds from '../../../assets/styles'
import { FieldError } from '../../../components'


export const WalletMetaInputs = (props) => {
    const template = props.wallet.template
    const user_inputs = template.inputs.filter(input => input.user_input)
    // console.log(template)
    // console.log(user_inputs)
    const inputs = user_inputs.map((input, index) => {
        return <View key={index}>
            <Text style={ds.label}>{input.display}</Text>
            <TextInput style={ds.input} placeholder={input.default} 
                value={input.name in props.meta_inputs ? props.meta_inputs[input.name] : ''}
                onChangeText={(data) => props.handleMetaInputChange(input, data)}
                keyboardType={input.type === 'number' ? 'numeric' : 'default'}
                />
            <FieldError errors={props.errors} name={input.name} />
            <Text style={ds.text}>{input.description}</Text>
        </View>
    })
    return <View>
        {inputs}
    </View>

}

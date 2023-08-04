import React from 'react'
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native'

import ds from '../../../assets/styles'
import tw from '../../../lib/tailwind'


export function OrganizationForm(props) {
    return (<View>
        <View style={{}}>
            <Text style={ds.label}>Name&nbsp;
            <Text style={ds.textSm}>(helper text)</Text></Text>
            <TextInput style={ds.input}
                onChangeText={props.handleNameChange}
                value={props.state.name} />
        </View>
        <View style={{}}>
            <Text style={ds.label}>Notes</Text>
            <TextInput style={[ds.input, tw`text-lg h-50`]} multiline={true}
                onChangeText={props.handleNotesChange}
                value={props.state.notes} />
        </View>
        <Pressable onPress={() => props.toDeleteScreen()} style={[ds.buttonXs, ds.redButton]}>
            <Text style={ds.buttonTextSm}>Delete</Text>
        </Pressable>
        <View style={{flex: 1}} />
    </View>
    )
}

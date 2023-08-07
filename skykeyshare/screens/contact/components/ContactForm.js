import React from 'react'
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native'

import ds from '../../../assets/styles'
import tw from '../../../lib/tailwind'


export function ContactForm(props) {
    return (<View>
        <View style={{}}>
            <Text style={ds.label}>Name&nbsp;
            <Text style={ds.textSm}>(their name)</Text></Text>
            <TextInput style={ds.input}
                onChangeText={props.handleNameChange}
                value={props.state.name} />
        </View>
        {props.create ? <View style={{}}>
                <Text style={ds.label}>Key</Text>
                <TextInput style={ds.input}
                    onChangeText={props.handlePublicKeyChange}
                    value={props.state.key} />
            </View> : <View>
                <Text style={ds.label}>Identity</Text>
                    <Text style={tw`mb-2 text-green-300`}>{props.state.their_verify_key}</Text>
            </View>
        }
        <View style={{}}>
            <Text style={ds.label}>Notes (optional)</Text>
            <TextInput style={[ds.input, tw`text-lg h-50`]} multiline={true}
                onChangeText={props.handleNotesChange}
                value={props.state.notes} />
        </View>
        {props.create ? 
        <View style={{}}>
            <Text style={ds.label}>From&nbsp;
            <Text style={ds.textSm}>(this is you)</Text></Text>
            <TextInput style={ds.input}
                onChangeText={props.handleMyNameChange}
                value={props.state.my_name} />
        </View> : null }
        <Pressable onPress={() => props.toDeleteScreen()} style={[ds.buttonXs, ds.redButton]}>
            <Text style={ds.buttonTextSm}>Delete</Text>
        </Pressable>
        <View style={{flex: 1}} />
    </View>
    )
}

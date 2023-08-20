import React from 'react'
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import tw from '../../lib/tailwind'

import StoredObject from '../../classes/StoredObject';

import ds from '../../assets/styles';
import { primary_route } from '../LandingScreen';

const _sample = {
    name: 'bitcoin_words_primary',
    created: 1643145907, 
    updated: 1643577907,
    data: 'Egg Cheese Ham Boat Federal House',
    description: 'my bitcoin secret'
}

export function ObjectForm(props) {
    return (<View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <Text style={ds.header}>Secret</Text>
            <View style={styles.nameContainer}>
                <Text style={ds.label}>Name</Text>
                <TextInput style={ds.input}
                    onChangeText={props.handleNameChange}
                    value={props.state.name} />
            </View>
            <View style={styles.nameContainer}>
                <Text style={ds.label}>Description (optional)</Text>
                <TextInput style={ds.input}
                    onChangeText={props.handleDescriptionChange}
                    value={props.state.description} />
            </View>
            <View style={styles.nameContainer}>
                <Text style={ds.label}>Data / Contents (1KB limit)</Text>
                <TextInput style={[ds.input, styles.dataInput]} multiline={true}
                    onChangeText={props.handleDataChange}
                    value={props.state.data} />
            </View>
            <View style={{flex: 1}} />
        </ScrollView>
        <View style={ds.buttonRow}>
            {props.toDeleteScreen ? 
                <Pressable onPress={() => props.toDeleteScreen()} style={{}}>
                    <Text style={tw`text-gray-400 underline`}>Delete</Text>
                </Pressable>: <View></View>
            }
            <Pressable onPressOut={() => props.handleSubmit()}
                    style={[ds.button, ds.greenButton]}>
                <Text style={ds.buttonText}>{props.buttonLabel}</Text>
            </Pressable>
        </View>
    </View>
    )
}


export default class StorageCreateScreen extends React.Component {
    stored_object = null
    state = {
        name: '',
        description: '',
        data: '',
    }
    constructor(props) {
        super(props)
        this.vault = props.vault
    }
    handleNameChange = (data) => {
        this.setState({name: data})
    }
    handleDescriptionChange = (data) => {
        this.setState({description: data})
    }
    handleDataChange = (data) => {
        this.setState({data: data})
    }
    finishSubmit() {
        console.log('StorageCreateScreen.finishSubmit: '+this.stored_object.pk)
        // this.props.navigation.replace('StorageView', {object_pk: this.stored_object.pk})
        const replaceAction = StackActions.replace(
            'StorageViewRoute', {object_pk: this.stored_object.pk})
        this.props.navigation.dispatch(replaceAction)
    }
    handleSubmit = () => {
        console.log('StorageCreateScreen.handleSubmit')
        this.stored_object = StoredObject.create(this.state.name,
            this.state.description, this.state.data, this.vault)
        this.stored_object.save(() => this.finishSubmit())
        // this.finishSubmit()
    }
    render() {
        return <ObjectForm state={this.state} handleSubmit={this.handleSubmit} 
            handleNameChange={this.handleNameChange}
            handleDescriptionChange={this.handleDescriptionChange}
            handleDataChange={this.handleDataChange}
            buttonLabel='Create'
        />
    }
}

const styles = StyleSheet.create({
    nameContainerX: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems:'flex-start'
    },
    dataInput: {
        textAlignVertical: 'top',
        fontSize: 14,
        height: 300,
    },
})

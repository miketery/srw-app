import React from 'react'
import { StyleSheet, ScrollView } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import ds from '../../assets/styles';

import { LoadingScreen } from '../../components';
import StoredObject from '../../classes/StoredObject';
import { ObjectForm } from './StorageCreateScreen'
import { primary_route } from '../LandingScreen';

export default class StorageEditScreen extends React.Component {
    object_pk = ''
    stored_object = null
    state = {
        name: '',
        description: '',
        data: '',
        loading: true,
    }
    constructor(props) {
        super(props)
        this.object_pk = props.route.params.object_pk
    }
    componentDidMount() {
        StoredObject.load(this.object_pk).then(stored_object => {
            this.stored_object = stored_object
            this.setState({
                loading: false,
                name: this.stored_object.name,
                description: this.stored_object.description,
                data: this.stored_object.data
            })
        })
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
        console.log('[StorageEditScreen.finishSubmit]', this.stored_object.pk)
        this.props.navigation.goBack()
    }
    handleSubmit = () => {
        console.log('[StorageEditScreen.handleSubmit]')
        this.stored_object.update(this.state.name,
            this.state.description, this.state.data)
        this.stored_object.save(() => this.finishSubmit()) 
    }
    toDeleteScreen = () => {
        this.props.navigation.navigate('StorageDeleteRoute', {object_pk: this.stored_object.pk})
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        return <ObjectForm state={this.state} handleSubmit={this.handleSubmit} 
            handleNameChange={this.handleNameChange}
            handleDescriptionChange={this.handleDescriptionChange}
            handleDataChange={this.handleDataChange}
            buttonLabel='Update'
            toDeleteScreen={this.toDeleteScreen}
        />
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    text: {
        color: '#eee',
    },
    nameContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems:'flex-start'
    },
    label: {
        fontSize: 20,
        color: '#DDD',
        marginBottom: 10,
    },
    nameInput: {
        backgroundColor: '#224',
        borderColor: '#CCC',
        borderWidth: 2,
        color: '#eee',
        fontSize: 20,
        height: 50,
        width: '100%',
        padding: 10,
        marginBottom: 25,
    },
    dataInput: {
        textAlignVertical: 'top',
        fontSize: 14,
        height: 300,
    },
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
})

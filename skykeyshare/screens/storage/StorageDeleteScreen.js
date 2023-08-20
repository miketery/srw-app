import React from 'react'
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import ds from '../../assets/styles';

import { LoadingScreen } from '../../components';
import StoredObject from '../../classes/StoredObject';
import { primary_route } from '../LandingScreen'

export default class StorageDeleteScreen extends React.Component {
    object_pk = ''
    stored_object = null
    state = {
        loading: true,
    }
    constructor(props) {
        super(props)
        this.object_pk = props.route.params.object_pk
    }
    componentDidMount() {
        StoredObject.load(this.object_pk).then(stored_object => {
            this.stored_object = stored_object
            this.setState({loading: false})
        })
    }
    finishSubmit() {
        console.log('[StorageDeleteScreen.finishSubmit] '+this.stored_object.pk)
        const resetAction = CommonActions.reset(primary_route([
            {
                name: 'StorageRoute',
                state: {
                    routes: [
                        {
                            name: 'StorageListRoute',
                        }
                    ]
                }
            }
        ]))
        this.props.navigation.dispatch(resetAction)    
    }
    handleDelete = () => {
        console.log('[StorageDeleteScreen.handleDelete]')
        this.stored_object.delete(() => this.finishSubmit()) 
    }
    cancelDelete() {
        this.props.navigation.goBack()
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        return <ScrollView style={ds.mainContainer}>
            <View style={styles.promptContainer}>
                <Text style={styles.prompt}>Are you sure you want to delete this?</Text>
            </View>
            <View style={styles.nameContainer}>
                <Text style={styles.name}>{this.stored_object.name}</Text>
            </View>
            <View style={styles.dateContainer}>
                <Text style={{color: '#ddd', marginRight: 10, fontSize: 12}}>
                    Created{'\n'}
                    Updated 
                </Text>
                <Text style={{color: '#ddd', fontSize: 12}}>
                {this.stored_object.created_format()}{'\n'}
                {this.stored_object.updated_format()}
                </Text>
            </View>
            <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{this.stored_object.description}</Text>
            </View>
            <View style={styles.buttonRow}>
                <Pressable onPress={() => this.handleDelete()}
                        style={[ds.button, ds.redButton]}>
                    <Text style={ds.buttonText}>Delete</Text>
                </Pressable>
                <Pressable onPress={() => this.cancelDelete()}
                        style={ds.button}>
                    <Text style={ds.buttonText}>Cancel</Text>
                </Pressable>
            </View>
        </ScrollView>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    promptContainer: {
        marginBottom: 10,
    },
    prompt: {
        color: 'white',
    },
    name: {
        color: 'white',
        fontSize: 25,
    },
    nameContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems:'flex-start',
        marginBottom: 10,
    },
    dateContainer: {
        flexDirection: 'row',
        color: 'white',
        marginBottom: 10,
    },
    descriptionContainer: {
        marginBottom: 10,
    },
    description: {
        color: 'white',
        fontSize: 14,
    },
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})

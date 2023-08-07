import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

import StoredObject from '../../classes/StoredObject'
import { LoadingScreen } from '../../components'

export default class StorageViewScreen extends React.Component {
    object_pk = null
    object = null
    created = null
    updated = null
    state = {loading: true}
    constructor(props) {
        super(props)
        this.object_pk = props.route.params.object_pk
        console.log('[StorageViewScreen]', this.object_pk)
    }
    componentDidMount() {
        StoredObject.load(this.object_pk).then(stored_object => {
            this.object = stored_object
            this.created = new Date(this.object.created).toLocaleString('en-US')
            this.updated = new Date(this.object.updated).toLocaleString('en-US')
            this.setState({loading: false})
        })
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <Text style={ds.header}>Secret</Text>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{this.object.name}</Text>
                </View>
                {this.object.descrciption != '' ?
                <View style={styles.descrciptionContainer}>
                    <Text style={styles.descrciption}>{this.object.description}</Text>
                </View> : null}
                <View style={styles.dataContainer}>
                    <Text style={styles.data}>{this.object.data}</Text>
                </View>
            </ScrollView>
            <View style={ds.buttonRow}>
                <View style={tw`flex-row`}>
                    <Text style={{color: '#ddd', marginRight: 10, fontSize: 12}}>
                        Created{'\n'}
                        Updated 
                    </Text>
                    <Text style={{color: '#ddd', fontSize: 12}}>
                    {this.created}{'\n'}{this.updated}
                    </Text>
                </View>
                <Pressable onPressIn={() => this.props.navigation.navigate(
                        'StorageEditRoute', {object_pk: this.object_pk})}
                        style={[ds.button, ds.purpleButton, tw`w-30`]}>
                    <Text style={ds.buttonText}>Edit</Text>
                </Pressable>
            </View>
        </View>
    }
}

const styles = StyleSheet.create({
    nameContainer: {
        marginBottom: 10,
    },
    name: {
        color: 'white',
        fontSize: 25,
    },
    descrciptionContainer: {
        marginBottom: 10,
    },
    descrciption: {
        color: 'white',
        fontSize: 14,
    },
    dataContainer: {
        backgroundColor: '#224',
        padding: 10,
        flex: 1,
    },
    data: {
        color: 'white',
        fontSize: 14,
    }
})

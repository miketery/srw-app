import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import tw from '../../lib/tailwind'

import { BottomGradient, LoadingScreen, TopGradient } from '../../components'
import ds from '../../assets/styles';
import SI from '../../classes/SI';

function toDate(ts) {
    return new Date(ts).toLocaleDateString('en-US')
}

export default class StorageListScreen extends React.Component {
    objects = []
    state = {loading: true, count: 0}
    constructor(props) {
        super(props)
        this.vault = props.vault
    }
    componentDidMount() {
        this.getItems()
    }
    getItems() {
        console.log('[StorageListScreen.getItems]')
        SI.getAll('objects', this.vault.pk).then(items => {
            this.objects = items
            this.objects.sort((a, b) =>
                a['name'].toLowerCase() > b['name'].toLowerCase() ? 1 : -1)
            this.setState({loading: false})
            console.log(this.objects)
        })
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        let rows = []
        for(let i=0; i < this.objects.length; i++)
            rows.push(<Pressable key={i} style={ds.row} onPress={
                    () => this.props.navigation.navigate('StorageViewRoute', {object_pk: this.objects[i]['pk']})}>
                <View style={tw`w-full`}>
                    <Text style={ds.text}>{this.objects[i]['name']}</Text>
                    <View style={ds.rowEnd}>
                        <Text style={tw`text-slate-300 text-xs`}>{toDate(this.objects[i]['created'])}</Text>
                    </View>
                </View>
            </Pressable>)
        return <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient}>
            <Text style={ds.header}>Secrets</Text>
                <View style={ds.rows}>
                    {rows}
                </View>
                {rows.length == 0 ? <Text style={ds.text}>You have no secrets, add some.</Text>: null}

            </ScrollView>
            <TopGradient />
            <BottomGradient />
            <View style={ds.buttonRow}>
                <Text style={ds.text}>
                    {rows.length} stored secrets
                </Text>
                <Pressable onPress={() => this.props.navigation.navigate(
                    'StorageCreateRoute')}
                    style={[ds.button, ds.blueButton]}>
                    <Text style={ds.buttonText}>Add Secret</Text>
                </Pressable>
            </View>
        </View>
    }
}

const styles = StyleSheet.create({
})

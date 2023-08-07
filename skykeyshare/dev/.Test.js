import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'

import tw from '../lib/tailwind'

import ds from '../assets/styles'
import SI from '../classes/SI'

import four_users from '../testdata/01_four_users'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BottomGradient, Error, Info, Loading, TopGradient, Warning } from '../components'

const TEST_VAULT_PK = 'v_3dd810d877c0f71c945ca5e3b0885f9d2a391235948c48a043ef8b123c783747'
const TEST_OBJECT_PK = 'o_19e41124-57c7-421b-9ad0-db374086141e'

export default class TestScreen extends React.Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        // For testing, call function here for faster iteration
    }
    toRecoverBasic() {
        this.props.navigation.dispatch(CommonActions.reset({index: 1, routes: [
            {name: 'Landing'}, {name: 'RecoverBasic'}
        ]}));
    }
    toStorageView(vault_pk, object_pk) {
        this.props.navigation.dispatch(CommonActions.reset({index: 1, routes: [
            {
                name: 'HomeRoute', params: {vault_pk: vault_pk},
                state: {
                    routes: [
                        {
                            name: 'StorageRoute', params: {vault_pk: vault_pk},
                            state: {
                                routes: [
                                    {
                                        name: 'StorageListRoute',
                                    },
                                ]
                            }
                        },
                    ]
                }
            },
        ]}))
    }
    loadSample(u) {
        // provides stored vaults and loads a choice
        let keys = Object.keys(four_users[u])
        keys.map(k => AsyncStorage.setItem(k, four_users[u][k]))
        setTimeout(() => this.props.navigation.replace('SplashRoute'), 100)
    }
    render() {
        let rows = Object.keys(four_users).map(k => 
            <Pressable onPress={() => this.loadSample(k)} key={k} style={tw`p-2 bg-blue-800 w-30 m-1`}>
                <Text style={ds.text}>
                    Load {k}
                </Text>
            </Pressable>
        )
        return <View style={[ds.mainContainerPtGradient, tw`pb-10`]}>
        <ScrollView style={ds.scrollViewGradient}>
        <Text style={ds.header}>Test Screen</Text>
            <View>
                {rows}
            </View>
            <View style={[tw`mb-2`, ds.neoDarkBlueButton]}>
                <Text style={ds.text}>Testing</Text>
            </View>
            <View style={[tw`mb-2`, ds.neoDarkRedButton]}>
                <Text style={ds.text}>Testing</Text>
            </View>
            <View style={[tw`mb-2`, ds.neoDarkGreenButton]}>
                <Text style={ds.text}>Testing</Text>
            </View>
            <View style={[tw`mb-2`, ds.neoDarkPurpleButton]}>
                <Text style={ds.text}>Testing</Text>
            </View>
            <Info t='Hello world! What is up!!!\nYes sir!' />
            <Warning error='Hello world! What is up!!!\nYes sir!' />
            <Error error='Hello world! What is up!!!\nYes sir!' />
            <Loading t='Hello world! What is up!!!\nYes sir!' />
        </ScrollView>
        <TopGradient />
        <BottomGradient />
        <View style={ds.buttonRow}>
            <Pressable onPressOut={() => this.props.navigation.goBack()}>
                <View style={[ds.button, tw`w-16`]}>
                    <Text style={ds.buttonText}>
                        <Icon name='arrow-back' size={24} />
                    </Text>
                </View>
            </Pressable>
        </View>
        </View>
    }
}


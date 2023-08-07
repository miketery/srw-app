import React from 'react'
import { CommonActions } from '@react-navigation/native'
import { render } from 'react-dom'
import { StyleSheet, Text, View, Button, 
    Image, Pressable, ImageBackground
} from 'react-native'

import tw from '../lib/tailwind'

import { DEV, TEST } from '../config'
import ds from '../assets/styles'
import SI from '../classes/SI'
import { LoadingScreen } from '../components'
import { landing_route, vault_route } from '../testdata/test_route'
import Cache from '../classes/Cache'


export const primary_route = (routes=[]) => ({
    routes: [
        {
            name: 'HomeRoute',
            params: {vault_pk: Cache.getVaultPk()},
            state: {
                routes: routes
            }
        },
    ]
})


export default class LandingScreen extends React.Component {
    state = {
        loading:true,
        styleToggle: false,
    }
    vault_pk = {}
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        // assumes only 1 vault (can support more later)
        let vault_index = SI.getIndex('vaults')
        // vault_index = []
        console.log('[LandingScreen.componentDidMount] found '+vault_index.length+' vaults')
        if(vault_index.length > 0) {
            Cache.setVaultPk(vault_index[0])
            const routes = primary_route(TEST ? vault_route : [])
            this.props.navigation.dispatch(CommonActions.reset(routes))
        } else {
            this.setState({loading:false})
            if(landing_route)
                this.props.navigation.navigate(landing_route)
        }
        // If no vault continue as is
    }
    // MASTER PASSWORD or FACEID CHECK or PIN
    // IF VAULT EXIST THEN GO TO VAULT
    // IF NOT VAULT EXIST GO TO LANDING (create or recover)

    render() {
        const styleToggle = this.state.styleToggle
        if(this.state.loading)
            return <LoadingScreen />
        return (<View style={tw`bg-midnight h-full items-center`}>
            <ImageBackground source={require('../assets/purple-city-bg.jpg' )}
                style={tw`h-full w-full`} resizeMode='cover'>
            <View style={tw`grow-1`} />
            <View style={tw`justify-center items-center`}>
                <Text style={tw`text-slate-200 shadow-white shadow text-6xl`}>Sky Castle</Text>
            </View>
            <View style={tw`grow-3`} />
            <View style={tw`flex flex-col items-center`}>
                <Pressable onPress={() =>  this.props.navigation.navigate('VaultCreateRoute')} 
                        style={[tw`p-4 w-4/5 mb-4`, {backgroundColor: 'rgba(21, 95, 21, 1)'}]}>
                    <Text style={tw`text-slate-100 text-lg text-center`}>Create Vault</Text>
                </Pressable>
                <Pressable onPress={() => this.props.navigation.navigate('VaultRecoverRoute')}
                        style={[tw`p-2 px-4`, {backgroundColor: 'rgba(88, 28, 135, 0.85)'}]}>
                    <Text style={tw`text-slate-200`}>Restore Existing Vault</Text>
                </Pressable>
            </View>
            <View style={tw`grow-2`} />
            {DEV &&
            <View style={tw`flex-row mb-8 justify-center`}>
                <Pressable onPress={() => this.props.navigation.navigate('TestRoute')}
                        style={ds.button}>
                    <Text style={ds.buttonText}>Developer</Text>
                </Pressable>
            </View>}
            {/*<View style={styles.buttonRow}>
                <Pressable onPress={() => this.setState({styleToggle: !this.state.styleToggle})}
                        style={ds.button}>
                    <Text style={ds.buttonText}>Toggle</Text>
                </Pressable>
            </View> */}
            </ImageBackground>
        </View>)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d1020',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center'
    },
    buttonRow: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        // backgroundColor: '#999'
    },
    neonHeader: {textShadow: '0 0 4px #fff, 0 0 11px #0F0, 0 0 19px #0F0'},
})
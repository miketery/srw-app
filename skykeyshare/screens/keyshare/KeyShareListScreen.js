import * as React from 'react'
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native'

import { LoadingScreen } from '../../components'
import { KEYSHARE_STATE } from '../../classes/KeyShare'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import SI from '../../classes/SI'

export default class KeyShareListScreen extends React.Component {
    state = {
        loading_a: true,
        loading_b: true,
        error: false,
    }
    keyshares = []
    contact_keyshares = []
    constructor(props) {
        super(props)
        this.vault = props.vault
    }
    focus = () => {
        console.log('[KeyShareListScreen.focus]')
        this.getItems()
    }
    componentDidMount() {
        console.log('[KeyShareListScreen.componentDidMount]')
        this.focus()
        this.props.navigation.addListener('focus', this.focus)
    }
    getItems() {
        console.log('[KeyShareListScreen.getItems]')
        SI.getAll('keyshares', this.vault.pk).then(keyshares => {
            this.keyshares = keyshares
            this.keyshares.sort((a, b) =>
                a['name'].toLowerCase() > b['name'].toLowerCase() ? 1 : -1)
            this.setState({loading_a: false})
        }).catch(e => {
            console.error(e)
            this.setState({loading: false, error: 'Something went wrong'})
        })
        SI.getAll('contact_keyshares', this.vault.pk).then(cks => {
            this.contact_keyshares = cks
            this.contact_keyshares.sort((a, b) =>
                a['manifest']['name'].toLowerCase() > b['manifest']['name'].toLowerCase() ? 1 : -1)
            this.setState({loading_b: false})
        })
    }
    render() {
        if(this.state.loading_a | this.state.loading_b)
            return <LoadingScreen />
        // if(this.state.error)
        //     return <Error>{this.state.error}</Error>
        let k_rows = []
        let ck_rows = []
        this.keyshares.forEach(k => 
            k_rows.push(<Pressable key={k['pk']} style={ds.row} onPress={
                    () => this.props.navigation.navigate(
                        k['state'] < KEYSHARE_STATE['SENT'] ? 
                            'KeyShareCreate' : 'KeyShareView', {keyshare_pk: k['pk']})}>
                <View>
                    <Text style={{color: "white"}}>{k['name']}</Text>
                    <Text style={{color: "white"}}>
                        {k['state'] == KEYSHARE_STATE.INIT ? 'Draft' : 
                            k['state'] == KEYSHARE_STATE.CONFIRMED ? 'Confirmed' :
                                k['state'] == KEYSHARE_STATE.SENT ? 'Shares Sent' :
                                    k['state'] == KEYSHARE_STATE.CLEANED ? '' : ''}
                    </Text>
                </View>
            </Pressable>)
        )
        this.contact_keyshares.forEach(ck => 
            ck_rows.push(<Pressable key={ck['pk']} style={ds.row} onPress={
                    () => this.props.navigation.navigate('ContactKeyShareViewRoute', {contact_keyshare_pk: ck['pk']})}>
                <Text style={{color: "white"}}>{ck['manifest']['name']}</Text>
            </Pressable>) 
        )
        return <View style={ds.mainContainer}>
            <ScrollView style={tw`pb-16`}>
                <View><Text style={ds.textXl}>Your Social Recoveries</Text></View>
                <View style={ds.rows}>
                    {k_rows}
                </View>
                {k_rows.length == 0 ? <Text style={ds.text}>You have no Social Recoveries, create one.</Text>: null}
                <View style={tw`mt-3 border-t-2 border-slate-200`}><Text style={ds.textXl}>Key Shares from Contacts</Text></View>
                <View style={ds.rows}>
                    {ck_rows}
                </View>
                {ck_rows.length == 0 ? <Text style={ds.text}>You have not received key shares from contacts.</Text>: null}
            </ScrollView>
            <View style={ds.buttonRow}>
                <Text style={ds.text}>
                    {k_rows.length} social recoveries<br />
                    {ck_rows.length} contact shares
                </Text>
                <Pressable onPress={() => this.props.navigation.navigate(
                    'KeyShareCreateRoute')}
                    style={[ds.button, ds.blueButton, tw`w-50`]}>
                    <Text style={ds.buttonText}>Create Recovery</Text>
                </Pressable>
            </View>
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

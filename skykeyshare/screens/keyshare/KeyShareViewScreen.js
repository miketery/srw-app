import * as React from 'react'
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'

import ds from '../../assets/styles'
import { KeyShare } from '../../classes/KeyShare'
import { Error, LoadingScreen } from '../../components'

import { Confirm } from './KeyShareCreate'

export default class KeyShareViewScreen extends React.Component {
    state = {
        loading: true
    }
    keyshare_pk = null
    keyshare = null
    vault = null

    constructor(props) {
        super(props)
        this.vault = props.vault
        this.keyshare_pk = props.route.params.keyshare_pk
    }
    componentDidMount() {
        KeyShare.load(this.keyshare_pk).then(k => {
            this.keyshare = k
            this.setState({loading: false})
        }).catch(e => {
            this.setState({error: e.message})
        })
    }
    render() {
        if(this.state.error)
            return <Error error={this.state.error} />
        if(this.state.loading)
            return <LoadingScreen />
        return <View style={ds.mainContainer}>
            <Confirm keyshare={this.keyshare} step="final" />
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

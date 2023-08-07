import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ds from '../assets/styles'

export default class Template extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return <View style={ds.mainContainer}>
            <Text>Template Screen</Text>
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

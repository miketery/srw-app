import { StyleSheet, Text, View } from 'react-native';
import * as React from 'react';

import ds from '../../assets/styles';

export default class KeyShareRecoverScreen extends React.Component {
    // start recovery
    render() {
        return <View style={ds.mainContainer}>
            <Text>KeyShareRecover Screen</Text>
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

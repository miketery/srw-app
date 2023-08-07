import React from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'

import SI from '../classes/SI'
import ds from '../assets/styles'

export default class SplashScreen extends React.Component {
    state = {
        // both need to be true to proceed to landing screen
        initialized: false,
        animation_complete: false,
    }
    constructor(props) {
        console.log('[SplashScreen.constructor]')
        super(props)
    }
    componentDidMount() {
        this.animate()
        this.initialize()
    }
    animate() {
        // TODO: animate the splash screen, somethign cool...
        setTimeout(() => {
            this.setState({animation_complete: true})
        }, 500)
    }
    initialize() {
        SI.init(true)
        .then(() => this.setState({initialized: true}))
    }
    toLanding() {
        this.props.navigation.reset({
            index: 0,
            routes: [{name: 'LandingRoute'}]
        })
    }
    componentDidUpdate() {
        if (this.state.initialized && this.state.animation_complete)
            this.toLanding()
    }
    render() {
        return <View style={styles.container}>
            <Text style={ds.text}>
                Splash Screen... {'\n\n'}
                *Put a pretty picture here*{'\n\n'}
                {this.state.initialized ? 'Initialized' : 'Initializing...'}{'\n\n'}
                {this.state.animation_complete ? 'Animated' : 'Animating...'}{'\n\n'}
            </Text>
            <Button onPress={() => this.state.initialized && this.toLanding()} title='Continue' />
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d1020',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
})

import React from 'react'
import { CommonActions } from '@react-navigation/native'
import { StyleSheet, Text, View, Button } from 'react-native'

import { ROUTES, SPLASH_ANIMATE_TIME, DEV } from '../config'
import SessionManager from '../classes/SessionManager'

import ds from '../assets/styles'
import tw from '../lib/tailwind'
import test_route from '../testdata/testroute'

export const primary_route = (routes=[]) => ({
    routes: [
        {
            name: ROUTES.HomeRoute,
            // params: {key: value},
            state: {
                routes: routes
            }
        },
    ]
})

export default class SplashScreen extends React.Component {
    state = {
        initialized: false,
        animation_complete: false,
        logged_in: false,
    }
    constructor(props) {
        console.log('[SplashScreen.js] constructor()')
        super(props)
    }
    checkSession = () => {
        console.log('[SplashScreen.js] checkSession()')
        const session = SessionManager.init().then(() =>
            SessionManager.checkSession()
        )
        return session
    }
    animate() {
        // TODO: animate the splash screen, somethign cool...
        setTimeout(() => {
            this.setState({animation_complete: true})
        }, SPLASH_ANIMATE_TIME)
    }
    componentDidMount() {
        console.log('[SplashScreen.js] componentDidMount()')
        this.animate()
        this.checkSession().then((logged_in) => {
            this.setState({initialized: true, logged_in: logged_in})
        }).catch((err) => {
            console.log(err)
            this.setState({initialized: true, logged_in: false})
        })
    }
    componentDidUpdate() {
        if (this.state.initialized && this.state.animation_complete) {
            if(this.state.logged_in) {
                const routes = primary_route(DEV ? test_route : [])
                this.props.navigation.dispatch(CommonActions.reset(routes))    
            } else {
                this.props.navigation.navigate(ROUTES.LandingRoute)
            }
        }
    }
    render() {
        return (
            <View style={ds.landingContainer}>
                <Text style={ds.header}>Splash Screen</Text>
                <View style={tw`flex-grow-1`} />
                <Button
                    title="Go to Home"
                    onPress={() => this.props.navigation.navigate(ROUTES.LandingRoute)}
                />
                <View style={tw`flex-grow-1`} />
            </View>
        )
    }
}

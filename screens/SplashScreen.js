import React, { useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native'
import { StyleSheet, Text, View, Button, Pressable } from 'react-native'

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

export default function SplashScreen({navigation}) {    
    const [initialized, setInitialized] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [counter, setCounter] = useState(0); // just for fun!

    const checkSession = () => {
        console.log('[SplashScreen.js] checkSession()')
        const session = SessionManager.init().then(() =>
            SessionManager.checkSession()
        )
        return session
    }
    const animate = () => {
        console.log('[SplashScreen.js] animate()')
        // TODO: animate the splash screen, something cool...
        setTimeout(() => {
            setAnimationComplete(true);
        }, SPLASH_ANIMATE_TIME)
        let counterInterval = setInterval(() => {
            setCounter((prevCounter) => {
                if (prevCounter < 100) {
                    return prevCounter + 1;
                } else {
                    clearInterval(counterInterval);
                    setAnimationComplete(true);
                    return prevCounter;
                }
            });
        }, SPLASH_ANIMATE_TIME / 100);
    }

    useEffect(() => {
        console.log('[SplashScreen.js] componentDidMount()')
        animate()
        checkSession().then((logged_in) => {
            setInitialized(true);
            setLoggedIn(logged_in);
        }).catch((err) => {
            console.log(err);
            setInitialized(true);
            setLoggedIn(false);
        });
    }, []);

    useEffect(() => {
        if (initialized && animationComplete) {
            if(loggedIn) {
                const routes = primary_route(DEV ? test_route : []);
                navigation.dispatch(CommonActions.reset(routes));    
            } else {
                navigation.navigate(ROUTES.LandingRoute);
            }
        }
    }, [initialized, animationComplete]);

    return (
        <View style={ds.landingContainer}>
            <Text style={ds.header}>Splash Screen</Text>
            <Text style={tw`text-white`}>{counter}%</Text>
            <View style={tw`flex-grow-1`} />
            {initialized &&
            <Pressable
                title="Go to Home"
                onPress={() => navigation.navigate(ROUTES.LandingRoute)}>
                <Text style={ds.buttonText}>Go to Landing</Text>
            </Pressable>}
            <View style={tw`flex-grow-1`} />
        </View>
    );
}

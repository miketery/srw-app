import React, { useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native'
import { StyleSheet, Text, View, Button, Pressable } from 'react-native'

import { ROUTES, SPLASH_ANIMATE_TIME, DEV, primary_route } from '../config'
import SessionManager from '../classes/SessionManager'

import SI from '../classes/SI';
import Cache
 from '../classes/Cache';
import ds from '../assets/styles'
import tw from '../lib/tailwind'
import { vault_test_route, no_vault_test_route } from '../testdata/testroute'


export default function SplashScreen({navigation}) {    
    const [initialized, setInitialized] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [hasVault, setHasVault] = useState(false);
    const [counter, setCounter] = useState(0); // just for fun!

    const checkHasVault = () => {
        console.log('[SplashScreen.js] checkHasVault()')
        let vault_index = SI.getIndex('vaults')
        console.log('[SplashScreen.js] found '+vault_index.length+' vaults')
        if(vault_index.length > 0) {
            Cache.setVaultPk(vault_index[0])
            return Promise.resolve(true)
        } else {
            return Promise.resolve(false)
        }
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
        SI.init().then(() => {
            checkHasVault().then((hasVault) => {
                setInitialized(true);
                setHasVault(hasVault);
            }).catch((err) => {
                console.log(err);
                setInitialized(true);
                setHasVault(false);
            });
        })
    }, []);

    useEffect(() => {
        if (initialized && animationComplete) {
            // if DEV then follow test routes
            if(hasVault) {
                const routes = primary_route(DEV ? vault_test_route : []);
                console.log(routes)
                navigation.dispatch(CommonActions.reset(routes));    
            } else {
                navigation.navigate(DEV ? no_vault_test_route : ROUTES.LandingRoute); 
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

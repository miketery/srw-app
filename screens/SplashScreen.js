import React, { useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native'
import { StyleSheet, Text, View, Button, Pressable } from 'react-native'

import ds from '../assets/styles'
import tw from '../lib/tailwind'

import { ROUTES, SPLASH_ANIMATE_TIME, DEV, primary_route } from '../config'
import { vault_test_route, no_vault_test_route } from '../testdata/testroute'

// import SessionManager from '../classes/SessionManager'
import SI, { StoredType } from '../classes/StorageInterface';
import VM from '../classes/VaultManager';

export default function SplashScreen({navigation}) {    
    const [initialized, setInitialized] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [hasVault, setHasVault] = useState(false);
    const [counter, setCounter] = useState(0); // just for fun!

    const checkHasVault = async () => {
        console.log('[SplashScreen.checkHasVault]')
        await VM.init()
        console.log(VM.vault_is_set())
        if(VM.vault_is_set()) {
            console.log('[SplashScreen.js] vault is set')
            // if has a vault then init the managers
            VM.init_managers()
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
        SI.init().then((res) => {
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
                console.log(DEV, no_vault_test_route)
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

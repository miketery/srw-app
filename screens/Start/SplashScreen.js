import React, { useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native'
import { Text, View } from 'react-native'

import tw from '../../lib/tailwind'

import { ROUTES, SPLASH_ANIMATE_TIME, primary_route, LOCAL } from '../../config'
import { vault_test_route, no_vault_test_route } from '../../testdata/testroute'

import { useSessionContext } from '../../contexts/SessionContext'
import SS from '../../services/StorageService';
import VaultManager from '../../managers/VaultManager';

import StartContainer from '../../components/StartContainer'
// import CtaButton from '../../components/CtaButton';

export default function SplashScreen({navigation}) {
    const {setVault, setManager} = useSessionContext();

    const [initialized, setInitialized] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [hasVault, setHasVault] = useState(false);
    const [counter, setCounter] = useState(0); // just for fun!

    const checkHasVault = async () => {
        const vaultManager = new VaultManager()
        await vaultManager.init()
        if(vaultManager.vaultIsSet()) {
            setVault(vaultManager.currentVault)
            setManager(vaultManager)
            console.log('[SplashScreen.checkHasVault] Vault and Manager are set in useSessionContext')
            return Promise.resolve(true)
        } else {
            console.log('[SplashScreen.checkHasVault] no Vault found')
            return Promise.resolve(false)
        }
    }
    const animate = () => {
        console.log('[SplashScreen.animate]')
        // TODO: animate the splash screen, something cool...
        // setTimeout(() => {
        //     setAnimationComplete(true);
        // }, SPLASH_ANIMATE_TIME)
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
        console.log('[SplashScreen.useEffect]')
        animate()
        SS.init(true).then((res) => {
            checkHasVault().then((res) => {
                setHasVault(res);
                setInitialized(true);
            }).catch((err) => {
                console.log(err);
                setHasVault(false);
                setInitialized(true);
            });
        })
    }, []);

    useEffect(() => {
        if (initialized && animationComplete) {
            // if DEV then follow test routes
            if(hasVault) {
                const routes = primary_route(LOCAL ? vault_test_route : []);
                LOCAL && console.log('LOCAL vault_test_route', routes)
                navigation.dispatch(CommonActions.reset(routes));    
            } else {
                if(LOCAL) {
                    console.log('LOCAL no_vault_test_coute', no_vault_test_route)
                    navigation.dispatch(CommonActions.reset(no_vault_test_route));
                } else
                    navigation.navigate(ROUTES.LandingRoute); 
            }
        }
    }, [initialized, animationComplete]);

    return (
        <StartContainer header={'Splash Screen'} imageStyle={{opacity: counter/100}}>
            <Text style={tw`text-white`}>{counter}%</Text>
            <View style={tw`flex-grow-1`} />
            {/* {initialized &&
            <CtaButton label="Go to Landing"
            onPressOut={() => navigation.navigate(ROUTES.LandingRoute)} />}
            <View style={tw`flex-grow-1`} /> */}
        </StartContainer>
    );
}

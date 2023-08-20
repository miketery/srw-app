import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import tw from './lib/tailwind'

import SplashScreen from './screens/SplashScreen';
import LandingScreen from './screens/LandingScreen';
import VaultCreateScreen from './screens/vault/VaultCreateScreen';
import VaultRecoverScreen from './screens/vault/VaultRecoverScreen';
import HomeScreen from './screens/HomeScreen';
import TestScreen from './dev/.Test'

const Stack = createNativeStackNavigator();


export default class App extends React.Component {
    state = {
        loading: true,
    }
    constructor(props) {
        super(props)
        console.log('[App.constructor]')
    }
    render() {
        // TODO redo splash init logic, redirect from here to Landing
        return (<View style={tw`bg-midnight h-full`}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={'SplashRoute'}
                        screenOptions={({route}) => {
                            return { headerShown: ['Test'].includes(route.name) } 
                        }}>
                    {/* Initialize Storage Interface, then go to landing */}
                    <Stack.Screen name='SplashRoute'>{props => 
                        <SplashScreen {...props} />}
                    </Stack.Screen>
                    {/* After splash go to landing - if vault exists load it -> redirect to Home
                    (checks if vault exist or lets you create / recover) */}
                    <Stack.Screen 
                        name='LandingRoute'
                        component={LandingScreen}
                        options={{ title: 'Landing' }} />
                    <Stack.Screen name='VaultCreateRoute'
                        options={{title: 'Create Vault'}}
                        component={VaultCreateScreen} />
                    <Stack.Screen name='VaultRecoverRoute'
                        options={{title: 'Recover Vault'}}
                        component={VaultRecoverScreen} />
                    <Stack.Screen name='HomeRoute' 
                        options={{title: 'Home'}}
                        component={HomeScreen} />
                    <Stack.Screen name='TestRoute'
                        options={{titles: 'Test'}}
                        component={TestScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </View>);
    }
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#0d1020',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

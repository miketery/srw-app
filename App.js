import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-web';
import { StatusBar } from 'expo-status-bar';

// import { StyleSheet, Text, View } from 'react-native';

import tw from './lib/tailwind'
import { ROUTES, DEV } from './config';

import SplashScreen from './screens/SplashScreen';
import LandingScreen from './screens/LandingScreen';
import VaultCreateScreen from './screens/VaultCreateScreen';
import RecoverInitScreen from './screens/RecoverInitScreen';

import HomeNav from './screens/HomeNav';
import DevTest from './screens/DevTest';

window.Buffer = window.Buffer || require("buffer").Buffer; 

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <SafeAreaView style={tw`bg-midnight h-full w-full`}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={ROUTES.SplashRoute}
                    screenOptions={({route}) => {
                        return { headerShown: ['Test'].includes(route.name) } 
                }}>
                    <Stack.Screen name={ROUTES.SplashRoute}>{props => 
                        <SplashScreen {...props} />}
                    </Stack.Screen>
                    {DEV && <Stack.Screen name={ROUTES.DevTestRoute}>{props => 
                        <DevTest {...props} />}
                    </Stack.Screen>}
                    <Stack.Screen 
                        name={ROUTES.LandingRoute}
                        component={LandingScreen}
                        options={{ title: 'Landing' }} />
                    <Stack.Screen name={ROUTES.VaultCreateRoute}>
                        {props => <VaultCreateScreen {...props} />}
                    </Stack.Screen>
                    {/* recover init screen */}
                    <Stack.Screen name={ROUTES.RecoverInitRoute}>
                        {props => <RecoverInitScreen {...props} />}
                    </Stack.Screen>
                    <Stack.Screen name={ROUTES.HomeNavRoute}>
                        {props => <HomeNav {...props} />}
                    </Stack.Screen>
                    
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

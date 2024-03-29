import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import toastConfig from './components/toastConfig'

import tw from './lib/tailwind'
import { ROUTES, DEV } from './config';

import { SessionContextProvider } from './contexts/SessionContext';

import SplashScreen from './screens/Start/SplashScreen';
import LandingScreen from './screens/Start/LandingScreen';
import VaultCreateScreen from './screens/Start/VaultCreateScreen';
import RecoverInitScreen from './screens/RecoverVault/RecoverInitScreen';

import HomeNav from './screens/HomeNav';
import { DevNoVaultNav } from './screens/Dev';

window.Buffer = window.Buffer || require("buffer").Buffer; 

const Stack = createNativeStackNavigator();

const originalWarn = console.warn;
const originalError = console.error;
console.warn = (...args) => { // console.trace(); // print stack trace
    if (args[0].includes('selectable prop is deprecated')) {} else { originalWarn(...args); }
};
console.error = (...args) => { if (args[0].includes('BackHandler ')) {} else { originalError(...args); }};

export default function App() {
    return (<SessionContextProvider>
        <SafeAreaView style={tw`bg-xmidnight h-full w-full`}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={ROUTES.SplashRoute}
                    screenOptions={({route}) => {
                        return { headerShown: ['Test'].includes(route.name) } 
                    }}>
                    <Stack.Screen name={ROUTES.SplashRoute}>{props => 
                        <SplashScreen {...props} />}
                    </Stack.Screen>
                    {DEV && <Stack.Screen name={ROUTES.DevNoVaultRoute}>{props => 
                        <DevNoVaultNav {...props} />}
                    </Stack.Screen>}
                    <Stack.Screen 
                        name={ROUTES.LandingRoute}
                        component={LandingScreen}
                        options={{ title: 'Landing' }} />
                    <Stack.Screen name={ROUTES.VaultCreateRoute}>
                        {props => <VaultCreateScreen {...props} />}
                    </Stack.Screen>
                    <Stack.Screen name={ROUTES.RecoverInitRoute}>
                        {props => <RecoverInitScreen {...props} />}
                    </Stack.Screen>
                    <Stack.Screen name={ROUTES.HomeNavRoute}>
                        {props => <HomeNav {...props} />}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
            <Toast config={toastConfig} visibilityTime={3000} />
            <StatusBar style="auto" />
        </SafeAreaView>
    </SessionContextProvider>);
}

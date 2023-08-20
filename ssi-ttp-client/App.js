import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import tw from './lib/tailwind'

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';


import SplashScreen from './screens/SplashScreen';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/General/LoginScreen';
import RegisterScreen from './screens/General/RegisterScreen';
import HomeScreen from './screens/General/HomeScreen';
// import PasskeyAuth from './screens/General/PasskeyScreen';
import { ROUTES } from './config';
// import TestScreen from './dev/.Test'

console.log('[App.js]');

const Stack = createNativeStackNavigator();

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

export default function App() {
  return (
    <View style={tw`bg-midnight h-full w-full`}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={ROUTES.SplashRoute}
          screenOptions={({route}) => {
            return { headerShown: ['Test'].includes(route.name) } 
        }}>
          <Stack.Screen name={ROUTES.SplashRoute}>{props => 
            <SplashScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen 
            name='LandingRoute'
            component={LandingScreen}
            options={{ title: 'Landing' }} />
          <Stack.Screen name={ROUTES.LoginRoute}>
            {props => <LoginScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name={ROUTES.RegisterRoute}>
            {props => <RegisterScreen {...props} />}
          </Stack.Screen>
          {/* <Stack.Screen name={ROUTES.PasskeyRoute}>
            {props => <PasskeyAuth {...props} />}
          </Stack.Screen> */}
          <Stack.Screen name={ROUTES.HomeRoute}
            options={{title: 'Home'}}
            component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}


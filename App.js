import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import tw from './lib/tailwind'

import SplashScreen from './screens/SplashScreen';

import { ROUTES } from './config';

const Stack = createNativeStackNavigator();

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
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

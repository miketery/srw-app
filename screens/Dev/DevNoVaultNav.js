import { useState } from 'react';
import { Text, View, Pressable } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Toast from 'react-native-toast-message';

import { ROUTES } from '../../config';

import DevLoadVaultsScreen from './DevLoadVaultsScreen'
import DevMessagesScreen from './DevMessagesScreen'
import DevRecoverCombineScreen from './DevRecoverCombineScreen'

const Stack = createNativeStackNavigator();

import ds from '../../assets/styles'
import tw from '../../lib/tailwind';
import { Error, GoBackButton, Info, Warning, Success } from '../../components';
import { AnimatedLabelInput, XTextInput } from '../../components/Input';
import StartContainer from '../../components/StartContainer';
import CtaButton from '../../components/CtaButton';

const lorum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ac nisl dapibus, ullamcorper eros a, tristique metus.'

const toastSuccess = () => {
    Toast.show({type:'success', text1: 'Success', text2: 'Hello world'})
}
const toastError = () => {
    Toast.show({type:'error', text1: 'Error', text2: 'Hello world'})
}
const toastInfo = () => {
    Toast.show({type:'info', text1: 'Info', text2: 'Hello world'})
}

export function DevNoVaultNav({navigation}) {
    const [name, setName] = useState('');

    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.DefaultRoute}>
        <Stack.Screen name={ROUTES.DefaultRoute} options={{title:'Dev Test'}}>
            {props => <StartContainer header="Dev Test" imageStyle={{opacity: 1}}>
                <View style={[ds.col, tw`flex-grow-1`]}>
                    <Pressable style={[ds.button, ds.blueButton, tw`mt-4`]} onPress={() => console.log('Pressed')}>
                        <Text style={ds.buttonText}>Test</Text>
                    </Pressable>
                    <Pressable style={[ds.button, ds.greenButton, tw`mt-4`]} onPress={() => 
                            navigation.navigate(ROUTES.DevLoadVaultsRoute)} >
                        <Text style={ds.buttonText}>Load Vaults</Text>
                    </Pressable>
                    <Pressable style={[ds.button, ds.greenButton, tw`mt-4`]} onPress={() => 
                            navigation.navigate(ROUTES.DevMessagesRoute)} >
                        <Text style={ds.buttonText}>Messages between contacts</Text>
                    </Pressable>
                    <Pressable style={[ds.button, ds.greenButton, tw`mt-4`]} onPress={() => 
                            navigation.navigate(ROUTES.DevRecoverCombineRoute)} >
                        <Text style={ds.buttonText}>Recover Combine</Text>
                    </Pressable>
                    <View>
                        <XTextInput label="Test" placeholder="Test" />
                        <AnimatedLabelInput label="Test" value={name} onChangeText={setName} />
                        <View style={tw`h-6`} />
                        <CtaButton onPressOut={() => toastSuccess()}
                            label="Success Toast" />
                        <CtaButton onPressOut={() => toastError()}
                            label="Error Toast" color='purple' />
                        <CtaButton onPressOut={() => toastInfo()}
                            label="Info Toast" color='green' />
                    </View>
                    <Info msg={lorum}  />
                    <Warning msg={lorum} />
                    <Error msg={lorum}  />
                    <Success msg={lorum} />

                </View>
                <GoBackButton onPressOut={() => navigation.goBack()} />
            </StartContainer>}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevLoadVaultsRoute} options={{title:'Dev Load Vaults'}}>
            {props => 
                <DevLoadVaultsScreen {...props} />}
        </Stack.Screen>
        
        <Stack.Screen name={ROUTES.DevMessagesRoute} options={{title:'Dev Load Vaults'}}>
            {props => 
                <DevMessagesScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevRecoverCombineRoute} options={{title:'Dev Recover Combine'}}>
            {props => 
                <DevRecoverCombineScreen {...props} />}
        </Stack.Screen>
    </Stack.Navigator>
}
import { Text, View, Pressable } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';

import DevLoadVaultsScreen from './DevLoadVaultsScreen'
import DevMessagesScreen from './DevMessagesScreen'
import DevRecoverCombineScreen from './DevRecoverCombineScreen'

const Stack = createNativeStackNavigator();

import ds from '../../assets/styles'
import tw from '../../lib/tailwind';
import { GoBackButton } from '../../components';
import { AnimatedLabelInput, XTextInput } from '../../components/Input';
import { LinearGradient } from 'expo-linear-gradient';
import StartContainer from '../Start/StartContainer';

export function DevNoVaultNav({navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName={ROUTES.DefaultRoute}>
        <Stack.Screen name={ROUTES.DefaultRoute} options={{title:'Dev Test'}}>
            {props => <StartContainer header="Dev Test" imageStyle={{opacity: 0.33}}>
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
                        <AnimatedLabelInput label="Test" placeholder="Test" />
                        <Pressable style={tw`w-full`}
                                onPressOut={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
                            <LinearGradient style={ds.xcta}
                                    locations={[0.2,1]}
                                    start={{x: 0.2, y:1}}
                                    end={{x:1,y:0}}
                                    colors={['#3A50F7', '#35F9F9']}>
                                <Text style={ds.buttonTextSm}>Create Vault</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
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
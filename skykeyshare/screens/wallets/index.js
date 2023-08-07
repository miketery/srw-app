import { createNativeStackNavigator } from '@react-navigation/native-stack'

import WalletCreateScreen from './WalletCreateScreen'
import WalletsListScreen from './WalletsListScreen'
import WalletViewScreen from './WalletViewScreen'
import SmartWalletViewScreen from './SmartWalletViewScreen'
import WalletEditScreen from './WalletEditScreen'
import WalletDeleteScreen from './WalletDeleteScreen'
import WalletTest from './.WalletTest'
import SmartWalletTest from './.SmartWalletTest'

const Stack = createNativeStackNavigator();

export default function WalletNavigator({vault, navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} 
    navigation={navigation} initialRouteName='WalletListRoute'>
        <Stack.Screen name='WalletListRoute' options={{title:'List Wallets'}}>
            {props => 
                <WalletsListScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='WalletCreateRoute' options={{title:'New Wallet'}}>
            {props => 
                <WalletCreateScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='WalletViewRoute' options={{title: 'Basic Wallet'}}>
            {props => 
                <WalletViewScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name='SmartWalletViewRoute' options={{title: 'Smart Wallet'}}>
            {props => 
                <SmartWalletViewScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name='WalletEditRoute' options={{title: 'Edit Wallet'}}>
            {props => 
                <WalletEditScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name='WalletDeleteRoute' options={{title: 'Delete Wallet'}}>
            {props => 
                <WalletDeleteScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name='WalletTestRoute' options={{title: 'Delete Wallet'}}>
            {props => 
                <WalletTest {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='SmartWalletTestRoute' options={{title: 'Delete Wallet'}}>
            {props => 
                <SmartWalletTest {...props}  />}
        </Stack.Screen>
    </Stack.Navigator>
}
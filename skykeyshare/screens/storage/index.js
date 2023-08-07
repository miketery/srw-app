import { createNativeStackNavigator } from '@react-navigation/native-stack'

import StorageCreateScreen from '../storage/StorageCreateScreen'
import StorageListScreen from '../storage/StorageListScreen'
import StorageViewScreen from '../storage/StorageViewScreen'
import StorageEditScreen from '../storage/StorageEditScreen'
import StorageDeleteScreen from '../storage/StorageDeleteScreen'

const Stack = createNativeStackNavigator();

export default function StorageNavigator({vault, navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}} navigation={navigation} initialRouteName='StorageListRoute'>
        <Stack.Screen name='StorageListRoute' options={{title:'List Secrets'}}>
            {props => 
                <StorageListScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='StorageCreateRoute' options={{title:'New Secret'}}>
            {props => 
                <StorageCreateScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='StorageViewRoute' options={{title: 'View Secret'}}>
            {props => 
                <StorageViewScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='StorageEditRoute' options={{title: 'Edit Secret'}}>
            {props => 
                <StorageEditScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='StorageDeleteRoute' options={{title: 'Delete Secret'}}>
            {props => 
                <StorageDeleteScreen {...props} vault={vault} />}
        </Stack.Screen>
    </Stack.Navigator>
}
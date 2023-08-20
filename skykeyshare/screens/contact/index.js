import { createNativeStackNavigator } from '@react-navigation/native-stack'

import ContactCreateScreen from '../contact/ContactCreateScreen'
import ContactListScreen from '../contact/ContactListScreen'
import ContactViewScreen from '../contact/ContactViewScreen'
import ContactEditScreen from '../contact/ContactEditScreen'
import ContactDeleteScreen from '../contact/ContactDeleteScreen'

const Stack = createNativeStackNavigator();

export default function ContactNavigator({vault, navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}}
    navigation={navigation} initialRouteName='ContactListRoute'>
        <Stack.Screen name='ContactListRoute' options={{title:'List Contacts'}}>
            {props => 
                <ContactListScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='ContactCreateRoute' options={{title:'New Contact'}}>
            {props => 
                <ContactCreateScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='ContactViewRoute' options={{title: 'View Contact'}}>
            {props => 
                <ContactViewScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='ContactEditRoute' options={{title: 'Edit Contact'}}>
            {props => 
                <ContactEditScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='ContactDeleteRoute' options={{title: 'Delete Contact'}}>
            {props => 
                <ContactDeleteScreen {...props} vault={vault} />}
        </Stack.Screen>
    </Stack.Navigator>
}
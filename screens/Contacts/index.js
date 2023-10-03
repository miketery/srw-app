import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';

import { useSession } from '../../services/SessionContext'

import ContactsListScreen from './ContactsListScreen'
// import ContactCreateScreen from './ContactCreateScreen'
// import ContactViewScreen from './ContactViewScreen'
// import ContactEditScreen from './ContactEditScreen'
// import ContactDeleteScreen from './ContactDeleteScreen'
import DevContacts from './DevContacts'

const Stack = createNativeStackNavigator();

export default function ContactsNavigator({navigation}) {
    const {manager} = useSession()

    return <Stack.Navigator screenOptions={{headerShown: false}}
    navigation={navigation} initialRouteName={ROUTES.ContactsListRoute}>
        <Stack.Screen name={ROUTES.ContactsListRoute} options={{title:'List Contacts'}}>
            {props => 
                <ContactsListScreen {...props} contacts_manager={manager.contacts_manager} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevContactsRoute} options={{title:'Dev Contacts'}}>
            {props => <DevContacts {...props} contacts_manager={manager.contacts_manager} />}
        </Stack.Screen>
        {/* <Stack.Screen name='ContactCreateRoute' options={{title:'New Contact'}}>
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
        </Stack.Screen> */}
    </Stack.Navigator>
}
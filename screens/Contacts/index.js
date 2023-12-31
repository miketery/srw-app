import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';

import { useSessionContext } from '../../contexts/SessionContext'

import ContactsListScreen from './ContactsListScreen'
import ContactAddScreen from './ContactAddScreen'
import ContactViewScreen from './ContactViewScreen'
// import ContactEditScreen from './ContactEditScreen'
// import ContactDeleteScreen from './ContactDeleteScreen'

import DevContacts from './DevContacts'

const Stack = createNativeStackNavigator();

export default function ContactsNavigator({navigation}) {
    const {manager, vault} = useSessionContext()

    return <Stack.Navigator screenOptions={{headerShown: false}}
    navigation={navigation} initialRouteName={ROUTES.ContactsListRoute}>
        <Stack.Screen name={ROUTES.ContactsListRoute} options={{title:'List Contacts'}}>
            {props => <ContactsListScreen {...props}
                contactsManager={manager.contactsManager} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevContactsRoute} options={{title:'Dev Contacts'}}>
            {props => <DevContacts {...props}
                contactsManager={manager.contactsManager} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.ContactAddRoute} options={{title:'Add Contact'}}>
            {props => <ContactAddScreen {...props} 
                contactsManager={manager.contactsManager} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.ContactViewRoute} options={{title: 'View Contact'}}>
            {props => <ContactViewScreen {...props} 
                contactsManager={manager.contactsManager} />}
        </Stack.Screen>
        {/* <Stack.Screen name='ContactEditRoute' options={{title: 'Edit Contact'}}>
            {props => 
                <ContactEditScreen {...props} vault={vault} />}
        </Stack.Screen>
        <Stack.Screen name='ContactDeleteRoute' options={{title: 'Delete Contact'}}>
            {props => 
                <ContactDeleteScreen {...props} vault={vault} />}
        </Stack.Screen> */}
    </Stack.Navigator>
}
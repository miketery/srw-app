import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';
import ContactListScreen from './ContactListScreen'
// import ContactCreateScreen from './ContactCreateScreen'
// import ContactViewScreen from './ContactViewScreen'
// import ContactEditScreen from './ContactEditScreen'
// import ContactDeleteScreen from './ContactDeleteScreen'

const Stack = createNativeStackNavigator();

export default function ContactNavigator({navigation}) {
    return <Stack.Navigator screenOptions={{headerShown: false}}
    navigation={navigation} initialRouteName={ROUTES.ContactListRoute}>
        <Stack.Screen name={ROUTES.ContactListRoute} options={{title:'List Contacts'}}>
            {props => 
                <ContactListScreen {...props} />}
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
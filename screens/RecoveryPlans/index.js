import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';

import { useSessionContext } from '../../contexts/SessionContext'

import RecoveryPlansListScreen from './RecoveryPlansListScreen'
// import RecoveryPlanCreateScreen from './RecoveryPlanCreateScreen'
// import RecoveryPlanViewScreen from './RecoveryPlanViewScreen'
// import RecoveryPlanEditScreen from './RecoveryPlantEditScreen'
// import RecoveryPlanDeleteScreen from './RecoveryPlanDeleteScreen'

import DevRecoveryPlan from '../Dev/DevRecoveryPlanScreen'

const Stack = createNativeStackNavigator();

export default function RecoveryPlanNavigator({navigation}) {
    const {manager, vault} = useSessionContext()

    return <Stack.Navigator screenOptions={{headerShown: false}}
    navigation={navigation} initialRouteName={ROUTES.ContactsListRoute}>
        <Stack.Screen name={ROUTES.RecoveryPlansListRoute} options={{title:'List Recovery Plans'}}>
            {props => <RecoveryPlansListScreen {...props}
                contactsManager={manager.contactsManager} />}
        </Stack.Screen>
        <Stack.Screen name={ROUTES.DevReocveryPlanRoute} options={{title:'Dev Recovery Plan'}}>
            {props => <DevRecoveryPlan {...props}
                contactsManager={manager.contactsManager} />}
        </Stack.Screen>
        {/* <Stack.Screen name={ROUTES.RecoveryPlanCreateRoute} options={{title:'Create Recovery Plan'}}>
            {props => <RecoveryPlanCreateScreen {...props} 
                contactsManager={manager.contactsManager} vault={vault} />}
        </Stack.Screen> */}
    </Stack.Navigator>
}
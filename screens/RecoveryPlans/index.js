import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';

import { useSessionContext } from '../../contexts/SessionContext'

import RecoveryPlansListScreen from './RecoveryPlansListScreen'
import RecoveryPlanCreateScreen from './RecoveryPlanCreateScreen'
import RecoveryPlanViewScreen from './RecoveryPlanViewScreen'
// import RecoveryPlanEditScreen from './RecoveryPlantEditScreen'
// import RecoveryPlanDeleteScreen from './RecoveryPlanDeleteScreen'

import DevRecoveryPlan from '../Dev/DevRecoveryPlanScreen'

const Stack = createNativeStackNavigator();

const routeConfigs = [
    {
        name: ROUTES.RecoveryPlansListRoute,
        title: 'List Recovery Plans',
        component: RecoveryPlansListScreen
    },
    {
        name: ROUTES.RecoveryPlanCreateRoute,
        title: 'Create Recovery Plan',
        component: RecoveryPlanCreateScreen
    },
    {
        name: ROUTES.RecoveryPlanViewRoute,
        title: 'View Recovery Plan',
        component: RecoveryPlanViewScreen
    },
    {
        name: ROUTES.DevReocveryPlanRoute,
        title: 'Dev Recovery Plan',
        component: DevRecoveryPlan
    },
  ]

export default function RecoveryPlanNavigator({navigation}) {
    const {manager, vault} = useSessionContext()

    return <Stack.Navigator screenOptions={{headerShown: false}}
    navigation={navigation} initialRouteName={ROUTES.ContactsListRoute}>
        {routeConfigs.map((route, index) => (
            <Stack.Screen
                key={index}
                name={route.name}
                options={{ title: route.title }}>
                {props => <route.component {...props}
                    vault={vault}
                    recoveryPlansManager={manager.recoveryPlansManager}
                    guardiansManager={manager.guardiansManager}
                />}
            </Stack.Screen>
        ))}
    </Stack.Navigator>
}
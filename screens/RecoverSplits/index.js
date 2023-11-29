import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { ROUTES } from '../../config';

import { useSessionContext } from '../../contexts/SessionContext'

import RecoverSplitsListScreen from './RecoverSplitsListScreen'
import RecoverSplitCreateScreen from './RecoverSplitCreateScreen'
import RecoverSplitViewScreen from './RecoverSplitViewScreen'
// import RecoverSplitEditScreen from './RecoverSplittEditScreen'
// import RecoverSplitDeleteScreen from './RecoverSplitDeleteScreen'
import GuardianViewScreen from './GuardianViewScreen'

import DevRecoverSplit from '../Dev/DevRecoverSplitScreen'

const Stack = createNativeStackNavigator();

const routeConfigs = [
    {
        name: ROUTES.RecoverSplitsListRoute,
        title: 'List Recovery Plans',
        component: RecoverSplitsListScreen
    },
    {
        name: ROUTES.RecoverSplitCreateRoute,
        title: 'Create Recovery Plan',
        component: RecoverSplitCreateScreen
    },
    {
        name: ROUTES.RecoverSplitViewRoute,
        title: 'View Recovery Plan',
        component: RecoverSplitViewScreen
    },
    {
        name: ROUTES.GuardianViewRoute,
        title: 'View Guardian',
        component: GuardianViewScreen
    },
    {
        name: ROUTES.DevReocveryPlanRoute,
        title: 'Dev Recovery Plan',
        component: DevRecoverSplit
    },
  ]

export default function RecoverSplitNavigator({navigation}) {
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
                    recoverSplitsManager={manager.recoverSplitsManager}
                    guardiansManager={manager.guardiansManager}
                />}
            </Stack.Screen>
        ))}
    </Stack.Navigator>
}
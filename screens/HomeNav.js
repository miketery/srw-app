import { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { DEV, ROUTES, TAB_BAR_ROUTES } from '../config';

import { useSession } from '../services/SessionContext'

import TabNavBar from './TabNavBar'
import MainHub from './MainHubScreen'

import ContactsNav from './Contacts'
import SecretsNav from './Secrets'
import NotificationsListScreen from './NotificationsScreen';
import { DevHasVaultNav } from './Dev'

const Tab = createBottomTabNavigator();

export default function HomeNavTest({props}) {
    const {manager} = useSession()

    const possible_offline = false
    const [ notifications, setNotifications] = useState([])
    const [ messagesFetchInterval, setMessagesFetchInterval ] = useState(null)

    const clearMessagesFetchInterval = () => {
        if (messagesFetchInterval) {
            clearInterval(messagesFetchInterval)
            setMessagesFetchInterval(null)
        }
    }

    useEffect(() => {
        console.log('[HomeNav] useEffect')
        const notificationsManager = manager.notifications_manager
        setNotifications(notificationsManager.getNotificationsArray())
        const notificationHook = notificationsManager.addCallback(setNotifications)
        const messagesFetchInterval = manager.messages_manager.startFetchInterval()
        setMessagesFetchInterval(messagesFetchInterval)
        return () => {
            console.log('[HomeNav] cleanup')
            notificationsManager.removeCallback(notificationHook)
            clearInterval(messagesFetchInterval)
        }
    }, [])

    return (
        <Tab.Navigator 
            initialRouteName={ROUTES.MainHubRoute}
            tabBar={(props) => <TabNavBar {...props}
                possible_offline={possible_offline}
                notificationCount={notifications.length} />}
            screenOptions={({route}) => {
                return { headerShown: route.name in TAB_BAR_ROUTES ? TAB_BAR_ROUTES[route.name].header : false}
        }}>
            <Tab.Screen name={ROUTES.MainHubRoute} >
                {(props) => <MainHub {...props} clearMessagesFetchInterval={clearMessagesFetchInterval} />}
            </Tab.Screen>
            <Tab.Screen name={ROUTES.ContactsRoute} >
                {(props) => <ContactsNav {...props} />}
            </Tab.Screen>
            <Tab.Screen name={ROUTES.SecretsRoute} >
                {(props) => <SecretsNav {...props} />}
            </Tab.Screen> 
            <Tab.Screen name={ROUTES.NotificationsRoute} 
                    options={{ tabBarBadge: notifications.length }}>
                {(props) => <NotificationsListScreen {...props} notifications={notifications} />}
            </Tab.Screen>
            {DEV && <Tab.Screen name={ROUTES.DevHasVaultRoute} >
                {(props) => <DevHasVaultNav {...props} />}
            </Tab.Screen>}
            {/*
            {/* <Tab.Screen name='ProfileRoute' >
                {(props) => <ProfileScreen vault={this.vault} {...props} />}
            </Tab.Screen>
            <Tab.Screen name="RecoveryManifestRoute">
                {(props) => <KeyShareNav vault={this.vault} {...props} />}
            </Tab.Screen> */}
        </Tab.Navigator>
    )
}
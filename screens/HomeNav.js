import { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { DEV, FETCH, ROUTES, TAB_BAR_ROUTES } from '../config';

import { useSessionContext } from '../contexts/SessionContext'

import TabNavBar from './TabNavBar'
import MainHub from './MainHubScreen'

import ContactsNav from './Contacts'
import SecretsNav from './Secrets'
import RecoverSplitsNav from './RecoverSplits'

import NotificationsListScreen from './NotificationsListScreen';
import { DevHasVaultNav } from './Dev'
import { NotificationTypes } from '../models/Notification';

const Tab = createBottomTabNavigator();

export default function HomeNavTest({props}) {
    const {manager, vault} = useSessionContext()

    const possible_offline = false
    const [ notifications, setNotifications] = useState([])
    const [ messagesFetchInterval, setMessagesFetchInterval ] = useState(null)
    const [ notificationsHook, setnotificationsHook ] = useState(null)

    const clearNotificationHook = () => {
        console.log('[HomeNav.clearNotificationHook] unset notificationsHook', notificationsHook)
        if (notificationsHook) {
            const notificationsManager = manager.notificationsManager
            notificationsManager.removeCallback(notificationsHook)
            setnotificationsHook(null)
        }
    }
    const startMessagesFetchInterval = (interval = 1500) => {
        const intervalId = manager.messagesManager.startFetchInterval(interval)
        console.log('SETTING fetchInterval', intervalId)
        setMessagesFetchInterval(intervalId)
    }
    const stopMessagesFetchInterval = () => {
        console.log('CLEARING fetchInterval', messagesFetchInterval)
        if (messagesFetchInterval) {            
            clearInterval(messagesFetchInterval)
            setMessagesFetchInterval(null)
        }
    }
    const setupNotifications = () => {
        const notificationsManager = manager.notificationsManager
        setNotifications(notificationsManager.getNotificationsArray())
        const hook = notificationsManager.addCallback(setNotifications)
        setnotificationsHook(hook)
    }

    useEffect(() => {
        console.log('[HomeNav] useEffect; setupNotifications()' + (FETCH ? ' && startMessagesFetchInterval()' : ''))
        setupNotifications()
        FETCH && startMessagesFetchInterval()
        return () => {
            stopMessagesFetchInterval()
            clearNotificationHook()
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
                {(props) => <MainHub {...props} notifications={notifications} />}
            </Tab.Screen>
            {!vault?.recovery && <>
                <Tab.Screen name={ROUTES.ContactsRoute} >
                    {(props) => <ContactsNav {...props} />}
                </Tab.Screen>
                <Tab.Screen name={ROUTES.SecretsRoute} >
                    {(props) => <SecretsNav {...props} />}
                </Tab.Screen>
                <Tab.Screen name={ROUTES.RecoverSplitRoute}>
                    {(props) => <RecoverSplitsNav {...props} />}
                </Tab.Screen>
            </>}
            <Tab.Screen name={ROUTES.NotificationsRoute} 
                    options={{ tabBarBadge: notifications.length }}>
                {(props) => <NotificationsListScreen {...props} notifications={notifications} />}
            </Tab.Screen>
            {/* <Tab.Screen name='ProfileRoute' >
                {(props) => <ProfileScreen {...props} />}
            </Tab.Screen> */}
            {/* <Tab.Screen name='SettingsRoute' >
                {(props) => <SettingsScreen {...props} />}
            </Tab.Screen> */}
            {DEV && <Tab.Screen name={ROUTES.DevHasVaultRoute} >
                {(props) => <DevHasVaultNav {...props}
                    fetching={messagesFetchInterval} 
                    clear={stopMessagesFetchInterval}
                    start={() => {
                        // stopMessagesFetchInterval()
                        startMessagesFetchInterval()
                    }} 
                />}
            </Tab.Screen>}
        </Tab.Navigator>
    )
}
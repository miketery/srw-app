import { useEffect, useState } from 'react';
import { Text, View, Pressable } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import tw from '../lib/tailwind'
import ds from '../assets/styles'
import { DEV, ROUTES, TAB_BAR_ROUTES } from '../config';
import eventEmitter from '../services/eventService';

import TabNavBar from './TabNavBar'
import { getNotificationsManager } from '../services/Cache';
import MainHub from './MainHubScreen'

import ContactsNav from './Contacts'
import SecretsNav from './Secrets'
import NotificationsListScreen from './NotificationsScreen';
import { DevHasVaultNav } from './Dev'

const Tab = createBottomTabNavigator();

export default function HomeNavTest({props}) {
    const possible_offline = false
    const [ notifications, setNotifications] = useState([])

    useEffect(() => {
        console.log('[HomeNav] useEffect')
        // eventEmitter.on('newNotifications', () => {
        //     console.log('[HomeNav] newNotifications event')
        //     setNotifications(getNotificationsManager().getNotifications())
        // })
        const notificationInterval = getNotificationsManager().startFetchInterval(setNotifications)
        return () => {
            console.log('[HomeNav] cleanup')
            clearInterval(notificationInterval)
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
                {(props) => <MainHub {...props} />}
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
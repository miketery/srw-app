import { Text, View, Pressable } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import tw from '../lib/tailwind'
import ds from '../assets/styles'
import { ROUTES, TAB_BAR_ROUTES } from '../config';

import TabNavBar from './TabNavBar'
import ContactNav from './Contacts'

const Tab = createBottomTabNavigator();

function Test(props) {
    const current_route = props.route.name 
    return (
        <View style={ds.landingContainer}>
            <Text style={ds.header}>Home</Text>
            <View>
                <Text style={ds.text}>Route: {current_route}</Text>
            </View>
            <View style={tw`flex-grow-1`} />
            <View style={tw`justify-around mb-10 flex-col items-center`}>
                {/* <Pressable style={[ds.ctaButton]}
                    onPress={() => props.navigation.navigate(ROUTES.VaultCreateRoute)}>
                    <Text style={ds.buttonText}>Create Vault</Text>
                </Pressable>
                <Pressable style={tw`mt-10`}
                    onPress={() => props.navigation.navigate(ROUTES.RecoverInitRoute)}>
                    <Text style={ds.textSm}>Recover Vault</Text>
                </Pressable> */}
            </View>
        </View>
    )
}

export default function HomeNavTest({props}) {
    const possible_offline = false
    return (
        <Tab.Navigator initialRouteName={ROUTES.MainHubRoute}
            tabBar={(props) => <TabNavBar {...props} possible_offline={possible_offline} />}
            screenOptions={({route}) => {
                return { headerShown: TAB_BAR_ROUTES[route.name].header }
        }}>
            <Tab.Screen name={ROUTES.MainHubRoute} >
                {(props) => <Test {...props} />}
            </Tab.Screen>
            <Tab.Screen name={ROUTES.ContactRoute} >
                {(props) => <ContactNav {...props} />}
            </Tab.Screen>
            <Tab.Screen name={ROUTES.NotificationsRoute} >
                {(props) => <Test {...props} />}
            </Tab.Screen>
            <Tab.Screen name={ROUTES.StoredObjectsRoute} >
                {(props) => <Test {...props} />}
            </Tab.Screen>{/* 
            {/* <Tab.Screen name='ProfileRoute' >
                {(props) => <ProfileScreen vault={this.vault} {...props} />}
            </Tab.Screen>
            <Tab.Screen name='StorageRoute' title='Secrets'>
                {(props) => <StorageNav vault={this.vault} {...props} />}
            </Tab.Screen>
            <Tab.Screen name="ContactsRoute">
                {(props) => <ContactNav vault={this.vault} {...props} />}
            </Tab.Screen>
            <Tab.Screen name="KeySharesRoute">
                {(props) => <KeyShareNav vault={this.vault} {...props} />}
            </Tab.Screen>
            <Tab.Screen name="WalletsRoute">
                {(props) => <WalletNav vault={this.vault} {...props} />}
            </Tab.Screen>
            <Tab.Screen name="NotificationsRoute"
                options={{ tabBarBadge: this.state.total_count }}>
                {(props) => <NotificationsListScreen
                    notifications={this.state.notifications}
                    vault={this.vault}
                    setNotifications={this.setNotifications}
                    {...props} />}
            </Tab.Screen> */}
        </Tab.Navigator>
    )
}
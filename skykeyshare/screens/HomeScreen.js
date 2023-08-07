import axios from 'axios'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'


import NI, {notification_template} from '../classes/NI'
import Cache from '../classes/Cache'

import { ErrorScreen, LoadingScreen } from '../components'
import { POLLING_ENABLED, POLLING_TIMEOUT, USER_ME_ENDPOINT } from '../config';


import MainHubScreen from './MainHubScreen'
import ProfileScreen from './general/ProfileScreen'
import NotificationsListScreen from './general/NotificationsListScreen'
import ContactNav from './contact'
import StorageNav from './storage'
import KeyShareNav from './keyshare'
import WalletNav from './wallets'
import TabNavBar from './TabNavBar'


const Tab = createBottomTabNavigator();

export default class HomeScreen extends React.Component {
    ts = null
    signed_ts = null
    state = {
        loading: true,
        notifcations_loading: true,
        error: false,
        wipe_count: 0,
        notifications: {
            ...notification_template
        },
        total_count: 0,
        short_code: '',
        possible_offline: false,
    }
    vault_pk = null
    vault = null
    ni_interval_handler = null
    constructor(props) {
        super(props)
        if(props.route.params == undefined) { // should be try / catch
            console.log('[HomeScreen.constructor] no params, this shouldnt happen...')
            props.navigation.reset({index: 0, routes: [{name: 'Landing'}]}) 
            return
        }
        this.vault_pk = props.route.params.vault_pk
        console.log('[HomeScreen] '+ this.vault_pk)
    }
    // TODO: if vault doesn't exist?
    componentDidMount() {
        console.log('[HomeScreen.componentDidMount]')
        // get vault from store
        Cache.getVault().then(vault => {
            this.vault = vault
            this.setState({loading: false, short_code: this.vault.short_code})
            this.getMe()
        }).catch(err => {
            this.setState({error: 'Error loading vault...'})
            console.log(err)
        })
    }
    getMe = async () => {
        axios.post(USER_ME_ENDPOINT, this.vault.createSignedPayload({}))
        .then(res => {
            if(this.vault.short_code != res.data.short_code) {
                this.vault.short_code = res.data.short_code
                this.vault.save(() => console.log('[HomeScreen.getMe] vault saved new short code'))
            }
            this.setState({short_code: this.vault.short_code})
            this.getNotifications()
        })
        .catch(err => {
            console.log('Error getting me...', err)
            if(err.response.status == 400 && err.response.data.error == 'user not found')
                this.vault.registerOnline().then(res => {
                    this.setState({short_code: this.vault.short_code})
                })
            else if(err.response.status == 0)
                this.setState({ possible_offline: true } 
                    // , () => setTimeout(() => this.setState({possible_offline: false}), 2000)
                )
        })
    }
    componentWillUnmount() {
        clearInterval(this.ni_interval_handler)
    }
    getNotifications() {
        console.log('[HomeScreen.getNotifications] polling', POLLING_ENABLED, POLLING_TIMEOUT)
        NI.init(this.vault.pk).then(n => {
            this.setNotifications(n)
            this.getServerNotifications()
            if(POLLING_ENABLED)
                this.ni_interval_handler = setInterval(
                    () => this.getServerNotifications(), POLLING_TIMEOUT * 1000)
        })
    }
    getServerNotifications() {
        NI.getFromServer(this.vault)
        .then(n => this.setNotifications(n))
    }
    setNotifications = (n) => {
        this.setState({notifications: n, total_count: NI.getCount()})
    }
    render() {
        if(this.state.error)
            return <ErrorScreen error={this.state.error} />
        if(this.state.loading)
            return <LoadingScreen t='' />
        return <Tab.Navigator screenOptions={({route}) => {
                    return { headerShown: false }
                }} tabBar={(props) => <TabNavBar {...props} possible_offline={this.state.possible_offline} />}>
                <Tab.Screen name='MainHubRoute' >
                    {(props) => <MainHubScreen vault={this.vault} {...props} />}
                </Tab.Screen>
                <Tab.Screen name='ProfileRoute' >
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
                </Tab.Screen>
            </Tab.Navigator>
    }
}

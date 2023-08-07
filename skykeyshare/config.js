import Constants from 'expo-constants';
import {env_test, env_dev, env_debug, env_local, 
    env_notification_polling, env_notification_timeout,
    env_blockapi_polling, env_blockapi_timeout, 
} from '@env'


export const TEST = env_test === 'true'
export const DEV = env_dev === 'true'
export const DEBUG = env_debug === 'true'
export const LOCAL = env_local === 'true'

export const POLLING_ENABLED = true //env_notification_polling === 'true'
export const POLLING_TIMEOUT = parseInt(env_notification_timeout)

export const BLOCKAPI_ENABLED = false //env_blockapi_polling === 'true'
export const BLOCKAPI_TIMEOUT = 120 //parseInt(env_blockapi_timeout)

export const BASE = LOCAL ? 'http://localhost:8000/api' : 'https://api.skycastle.dev/api'

export const MESSAGE_POST_ENDPOINT = BASE + '/message/post/'
export const MESSAGE_GET_ENDPOINT = BASE + '/message/get/'
export const MESSAGE_OPENED_ENDPOINT = BASE + '/message/open/' //mark opened
export const USER_ME_ENDPOINT = BASE + '/user/me/' //gets current user (good to get code)

export const WALLET_CREATE_ENDPOINT = BASE + '/wallet/create/'
export const WALLET_PARTICIPANT_KEY_ADD_ENDPOINT = BASE + '/wallet/participant/key/add/'

DEBUG && console.log('DEBUG: ', {
    TEST: TEST, DEV: DEV, LOCAL: LOCAL, BASE: BASE,
    POLLING_ENABLED: POLLING_ENABLED, POLLING_TIMEOUT: POLLING_TIMEOUT,
    BLOCKAPI_ENABLED: BLOCKAPI_ENABLED, BLOCKAPI_TIMEOUT: BLOCKAPI_TIMEOUT,
})

// describe whether it should be in the tab bar
// and whether it has header
export const HOME_ROUTES = {
    MainHubRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    ContactsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    WalletsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    NotificationsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    
    StorageRoute: {header: false, tabBarIconHide: true, tabBarHide: false},
    SettingsRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    ProfileRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    KeySharesRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
}
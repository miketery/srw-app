import {
    env_test, env_dev, 
    env_debug, env_local,
} from '@env';

export const TEST = env_test === 'true'
export const DEV = env_dev === 'true'
export const DEBUG = env_debug === 'true'
export const LOCAL = env_local === 'true'

export const SPLASH_ANIMATE_TIME = DEBUG ? 100 : 666

export const BASE =
    LOCAL ? 'http://localhost:8000/api' : 
    DEV ? 'https://api.ssi.arxsky.dev/api' : 
          'https://api.ssi.arxsky.com/api'

export const ENDPOINTS = {
    
}

DEBUG && console.log('DEBUG: ', {
    TEST: TEST, DEV: DEV, LOCAL: LOCAL, BASE: BASE
})

export const ROUTES = {
    TestRoute: 'TestRoute',
    //
    SplashRoute: 'SplashRoute',
    LandingRoute: 'LandingRoute',
    UnlockRoute: 'UnlockRoute',
    RegisterRoute: 'RegisterRoute',

    VaultCreateRoute: 'VaultCreateRoute',
    RecoverInitRoute: 'RecoverInitRoute',
    //
    HomeRoute: 'HomeRoute',
    MainHubRoute: 'MainHubRoute',
    ProfileRoute: 'ProfileRoute',
    SettingsRoute: 'SettingsRoute',
    NotificationsRoute: 'NotificationsRoute',

    //
    ContactsRoute: 'ContactsRoute',
    StoredObjectsRoute: 'StoredObjectsRoute',
    RecoveriesRoute: 'RecoveriesRoute',
}

export const TAB_BAR_ROUTES = {
    // MainHubRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // ProfileRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // OrganizationRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // CredentialRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // TestRoute: {header: false, tabBarIconHide: true, tabBarHide: false},
    // WalletsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // NotificationsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    
    // StorageRoute: {header: false, tabBarIconHide: true, tabBarHide: false},
    // SettingsRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    // ProfileRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    // KeySharesRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
}

import {
    env_dev, 
    env_debug,
    env_local,
    env_mock,
    env_fetch,
    env_mockdata,
} from '@env';

// const env_dev = 'true'
// const env_debug = 'true'
// const env_local = 'true'

export const DEV = env_dev === 'true'
export const DEBUG = env_debug === 'true'
export const LOCAL = env_local === 'true'
// export const MOCK = false
export const MOCK = env_mock === 'true'
export const MOCKDATA = env_mockdata === 'true'
// export const FETCH = true
export const FETCH = env_fetch === 'true'

export const SPLASH_ANIMATE_TIME = DEBUG ? 100 : 666

export const BASE =
    LOCAL ? 'http://localhost:8000/api' : 
    DEV ? 'https://api.srw.arxsky.dev/api' : 
          'https://dai.arxsky.com/api'

export const ENDPOINTS = {
    ME: '/user/me/',
    REGISTER: '/user/register/',
    CONTACT_LOOKUP: '/user/lookup/',

    POST_MESSAGE: '/message/post/',
    GET_MESSAGES: '/message/get/',
}

DEBUG && console.log('DEBUG: ', {
    DEV: DEV, LOCAL: LOCAL, BASE: BASE, MOCK: MOCK
})

export const ROUTES = {
    DefaultRoute: 'DefaultRoute',

    DevNoVaultRoute: 'DevNoVaultRoute',
    DevGeneralRoute: 'DevGeneralRoute',
    DevLoadVaultsRoute: 'DevLoadVaultsRoute',
    DevMessagesRoute: 'DevMessagesRoute',
    
    DevHasVaultRoute: 'DevHasVaultRoute',
    DevContactsRoute: 'DevContactsRoute',
    DevSecretsRoute: 'DevSecretsRoute',
    DevReocveryPlanRoute: 'DevReocveryPlanRoute',
    DevDigitalAgentRoute: 'DevDigitalAgentRoute',
    DevRecoverCombineRoute: 'DevRecoverCombineRoute',

    SplashRoute: 'SplashRoute',
    LandingRoute: 'LandingRoute',
    UnlockRoute: 'UnlockRoute',
    RegisterRoute: 'RegisterRoute',

    VaultCreateRoute: 'VaultCreateRoute',
    RecoverInitRoute: 'RecoverInitRoute',
    //
    HomeNavRoute: 'HomeNavRoute',
    MainHubRoute: 'MainHubRoute',
    ProfileRoute: 'ProfileRoute',
    SettingsRoute: 'SettingsRoute',
    NotificationsRoute: 'NotificationsRoute',

    //
    ContactsRoute: 'ContactsRoute',
    ContactsListRoute: 'ContactsListRoute',
    ContactAddRoute: 'ContactAddRoute',
    ContactViewRoute: 'ContactViewRoute',
    ContactEditRoute: 'ContactEditRoute',

    //
    SecretsRoute: 'SecretsRoute',
    SecretsListRoute: 'SecretsListRoute',
    SecretViewRoute: 'SecretViewRoute',
    SecretEditRoute: 'SecretEditRoute',
    SecretCreateRoute: 'SecretCreateRoute',

    //
    RecoveryPlanRoute: 'RecoveryPlanRoute',
    RecoveryPlansListRoute: 'RecoveryPlansListRoute',
    RecoveryPlanCreateRoute: 'RecoveryPlanCreateRoute',
    RecoveryPlanViewRoute: 'RecoveryPlanViewRoute',

    //
    GuardianViewRoute: 'GuardianViewRoute',

}

// route which is a dictrionary with a name and params
// device type for route
interface Route {
    name: string
    params?: any
    state?: any
}

// useful for redirecting, for example, (Home, nestedRoute(Contacsts, [ContactsList, ContactView]))
export const nestedRoute = (route: string, nested: Route[]): Route => {
    return {
        name: route,
        state: {
            routes: nested
        }
    }
}

export const TAB_BAR_ROUTES = {
    [ROUTES.MainHubRoute]: {
        header: false,
        tabBarIconHide: false,
        tabBarHide: false,
        icon: 'flash',
    },
    [ROUTES.ContactsRoute]: {
        header: false,
        tabBarIconHide: false,
        tabBarHide: false,
        icon: 'people',
    },
    [ROUTES.SecretsRoute]: {
        header: false,
        tabBarIconHide: false,
        tabBarHide: false,
        icon: 'key',
    },
    [ROUTES.RecoveryPlanRoute]: {
        header: false,
        tabBarIconHide: false,
        tabBarHide: false,
        icon: 'shield',
    },
    [ROUTES.NotificationsRoute]: {
        header: false,
        tabBarIconHide: false,
        tabBarHide: false,
        icon: 'notifications',
    },

    [ROUTES.DevHasVaultRoute]: {
        header: false,
        tabBarIconHide: false,
        tabBarHide: false,
    },

    // ProfileRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // OrganizationRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // CredentialRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // TestRoute: {header: false, tabBarIconHide: true, tabBarHide: false},
    // WalletsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    
    // SettingsRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    // ProfileRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    // KeySharesRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
}

export const primary_route = (routes: Route[]=[]): {routes: Route[]} => ({
    routes: [
        {
            name: ROUTES.HomeNavRoute,
            // params: {key: value},
            state: {
                routes: routes
            }
        },
    ]
})
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
    ME: '/user/me/',
    REGISTER: '/user/register/',
    LOGIN: '/login',
}

DEBUG && console.log('DEBUG: ', {
    TEST: TEST, DEV: DEV, LOCAL: LOCAL, BASE: BASE
})

export const ROUTES = {
    DevNoVaultRoute: 'DevNoVaultRoute',
    DevGeneralRoute: 'DevGeneralRoute',
    DevLoadVaultsRoute: 'DevLoadVaultsRoute',

    DevHasVaultRoute: 'DevHasVaultRoute',
    DevContactsRoute: 'DevContactsRoute',
    DevSecretsRoute: 'DevSecretsRoute',
    DevRecoveriesRoute: 'DevRecoveriesRoute',
    DevDigitalAgentRoute: 'DevDigitalAgentRoute',

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
    ContactCreateRoute: 'ContactCreateRoute',
    ContactViewRoute: 'ContactViewRoute',
    ContactEditRoute: 'ContactEditRoute',

    //
    SecretsRoute: 'SecretsRoute',
    SecretsListRoute: 'SecretsListRoute',
    SecretViewRoute: 'SecretViewRoute',
    SecretEditRoute: 'SecretEditRoute',
    SecretCreateRoute: 'SecretCreateRoute',

    //
    RecoveriesRoute: 'RecoveriesRoute',
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
    MainHubRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    ContactsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    SecretsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    NotificationsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},

    DevHasVaultRoute: {header: false, tabBarIconHide: false, tabBarHide: false},

    // ProfileRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // OrganizationRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // CredentialRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // TestRoute: {header: false, tabBarIconHide: true, tabBarHide: false},
    // WalletsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    
    // SettingsRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    // ProfileRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    KeySharesRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
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
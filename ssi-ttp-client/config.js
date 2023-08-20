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
    login: `${BASE}/auth/token/login/`,
    logout: `${BASE}/auth/token/logout/`,
    register: `${BASE}/auth/users/`,
    user: `${BASE}/auth/users/me/`,
    permissions: `${BASE}/permissions/`,
    organization: uuid => `${BASE}/organizations/${uuid}/`, // get org
    organizations: `${BASE}/organizations/`, // get orgs (i.e. list orgs)
    template: uuid => `${BASE}/credentials/templates/${uuid}/`, // get template
    templates_by_org: uuid => `${BASE}/credentials/templates/by_org/${uuid}/`, // get credential templates by org
    credential: uuid => `${BASE}/credentials/${uuid}/`, // get credential
    credential_create: `${BASE}/credentials/create/`, // create credential
    credentials: `${BASE}/credentials/my/`, // list my credentials
    credentials_for_templates: `${BASE}/credentials/for_templates/`, // list credentials for templates
    credentials_by_org: uuid => `${BASE}/credentials/by_org/${uuid}/`, // list org credentials
    credential_state_update: uuid => `${BASE}/credentials/state/${uuid}/`, // change state, pass state: String

    // verifier endpoints
    // reference django mysite.verif.urls
    verifier: uuid => `${BASE}/verifiers/${uuid}/`, // get verifier
    verifiers: `${BASE}/verifiers/`, // list verifiers
    verifiers_by_org: uuid => `${BASE}/verifiers/by_org/${uuid}/`, // list org verifiers
    verify_credential: `${BASE}/verifiers/verify/`, // verify credential
}

DEBUG && console.log('DEBUG: ', {
    TEST: TEST, DEV: DEV, LOCAL: LOCAL, BASE: BASE
})

export const ROUTES = {
    TestRoute: 'TestRoute',
    //
    SplashRoute: 'SplashRoute',
    LandingRoute: 'LandingRoute',
    LoginRoute: 'LoginRoute',
    RegisterRoute: 'RegisterRoute',
    HomeRoute: 'HomeRoute',
    MainHubRoute: 'MainHubRoute',
    ProfileRoute: 'ProfileRoute',
    //
    OrganizationRoute: 'OrganizationRoute',
    OrganizationListRoute: 'OrganizationListRoute',
    OrganizationCreateRoute: 'OrganizationCreateRoute',
    OrganizationViewRoute: 'OrganizationViewRoute',
    OrganizationEditRoute: 'OrganizationEditRoute',
    OrganizationDeleteRoute: 'OrganizationDeleteRoute',

    //
    CredentialRoute: 'CredentialRoute',
    CredentialViewRoute: 'CredentialViewRoute',
    CredentialListRoute: 'CredentialListRoute',
    CredentialRequestRoute: 'CredentialRequestRoute', // i want a new credential
    CredentialPresentRoute: 'CredentialPresentRoute', // i want to presetn a credenital
    //
    VerifierCreateRoute: 'VerifierCreateRoute',
    VerifierViewRoute: 'VerifierViewRoute',

    //
    PasskeyRoute: 'PasskeyRoute', // TEST
}

export const TAB_BAR_ROUTES = {
    MainHubRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    ProfileRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    OrganizationRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    CredentialRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    TestRoute: {header: false, tabBarIconHide: true, tabBarHide: false},
    // WalletsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    // NotificationsRoute: {header: false, tabBarIconHide: false, tabBarHide: false},
    
    // StorageRoute: {header: false, tabBarIconHide: true, tabBarHide: false},
    // SettingsRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    // ProfileRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
    // KeySharesRoute: {header: false, tabBarIconHide: true, tabBarHide: true},
}

export const INPUT_TYPES = {
    // shoudl match credentials.models.FieldType
    STRING: 'string',
    TEXT: 'text',
    INTEGER: 'integer',
    DECIMAL: 'decimal',
    DATE: 'date',
    DATETIME: 'datetime',
    TIME: 'time',
    BOOLEAN: 'boolean',
    // LIST: 'list',
    // TUPLE: 'tuple',
    // DICT: 'dict',
    // SELECT: 'select',
    // MULTISELECT: 'multiselect',
}
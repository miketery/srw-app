import { DEV } from "../config"


const FLAG = true
const FLAG_B = false
const vaild_routes = {
    WalletsRoute: 'WalletsRoute',
    ContactsRoute: 'ContactsRoute',
    KeySharesRoute: 'KeySharesRoute',
    MainHubRoute: 'MainHubRoute',
    Notifications: 'Notifications',
    StorageRoute: 'StorageRoute',
}

const top_level = DEV && FLAG ? vaild_routes.WalletsRoute : vaild_routes.MainHubRoute

const CONTACT_PK = 'c_G7Yge7RsBUF9UCmMiCpc37iECobnMvQtREFg8hUVxUkr'

const routes = {
    'WalletsRoute':  [
        { name: 'WalletListRoute' },
        // { name: 'WalletCreateRoute' },
        // { name: 'WalletCreateRoute', params: {wallet_pk: 'z_f20387fe-e193-49f7-a7a7-187aa260641c'} },
        // { name: 'SmartWalletTestRoute' }
        // { name: 'WalletViewRoute', params: {wallet_pk: 'w_ee467c2c-38b5-447b-97b4-adbb27b6499f'}},
        // { name: 'WalletCreateRoute' },
    ],
    'ContactsRoute': [
        { name: 'ContactListRoute' },
        // { name: 'ContactCreateRoute' },
        // { name: 'ContactViewRoute', params: {contact_pk: CONTACT_PK}},
        // { name: 'ContactEditRoute', params: {contact_pk: CONTACT_PK}},
        // { name: 'ContactDeleteRoute', params: {contact_pk: CONTACT_PK}},
    ],
    'KeySharesRoute': [
        { name: 'KeySharesListRoute' },
        // { name: 'ContactKeyShareView', params: {
        //     contact_keyshare_pk: 'Ck6edf5f32-f360-4d68-a406-5a3d3292108d'}},
        // { name: 'KeyShareCreate', params: {
        //     keyshare_pk: "k_f4c0c4fe-d143-434f-8433-681d7ca690c9"}},
    ],
    'StorageRoute': [
        { name: 'StorageListRoute' },
        { name: 'StorageCreateRoute' },
    ],
}

const vault_route = [
    {
        name: top_level,
        state: {
            routes: routes[top_level]
        }
    }
]
const landing_route = DEV && FLAG_B ? 'VaultCreateRoute' : null

export {
    landing_route,
    vault_route,
}
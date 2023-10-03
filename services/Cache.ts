import Vault from '../models/Vault'
import VaultManager from '../managers/VaultManager'

interface CacheInterface {
    vault: Vault | null;
    vault_manager: VaultManager | null;
}

const __CACHE: CacheInterface = {
    vault: null, // current vault
    vault_manager: null, //vault manager
}
// TODO: probably delete this file as using context now...
const Cache = {
    setVaultAndManager: (vault: Vault, vault_manager: VaultManager) => {
        console.log('[Cache.setVaultAndManager] ' + vault.pk)
        __CACHE.vault = vault
        __CACHE.vault_manager = vault_manager
    },
    get vault_manager(): VaultManager {
        if(__CACHE.vault_manager)
            return __CACHE.vault_manager;
        else
            throw new Error('VaultManager not set')
    },
    get vault_pk(): string {
        if(__CACHE.vault)
            return __CACHE.vault.pk;
        else
            throw new Error('Vault not set')
    },
    get vault(): Vault {
        if(__CACHE.vault)
            return __CACHE.vault;
        else
            throw new Error('Vault not set')
    },

    // _getAndSetContacts: async () => Contact.getAll(__CACHE.vault_pk).then(contacts => {
    //     __CACHE.contacts = contacts
    //     return __CACHE.contacts
    // }),
    // getContacts: async (force=false) => __CACHE.contacts === null || force ? 
    //     Cache._getAndSetContacts() : __CACHE.contacts,
}

Object.freeze(Cache)

// export function getContactsManager() {
//     return __CACHE.vault_manager ?
//         __CACHE.vault_manager.contacts_manager : null
// }
// export function getSecretsManager() {
//     return __CACHE.vault_manager ?
//         __CACHE.vault_manager.secrets_manager : null
// }
// export function getNotificationsManager() {
//     return __CACHE.vault_manager ?
//         __CACHE.vault_manager.notifications_manager : null
// }
// export function getMessagesManager() {
//     return __CACHE.vault_manager ?
//         __CACHE.vault_manager.messages_manager : null
// }

export default Cache
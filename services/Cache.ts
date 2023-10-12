import Vault from '../models/Vault'
import VaultManager from '../managers/VaultManager'

interface CacheInterface {
    vault: Vault | null;
    vaultManager: VaultManager | null;
}

const __CACHE: CacheInterface = {
    vault: null, // current vault
    vaultManager: null, //vault manager
}
// TODO: probably delete this file as using context now...
const Cache = {
    setVaultAndManager: (vault: Vault, vaultManager: VaultManager) => {
        console.log('[Cache.setVaultAndManager] ' + vault.pk)
        __CACHE.vault = vault
        __CACHE.vaultManager = vaultManager
    },
    get vaultManager(): VaultManager {
        if(__CACHE.vaultManager)
            return __CACHE.vaultManager;
        else
            throw new Error('VaultManager not set')
    },
    get vaultPk(): string {
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

    // _getAndSetContacts: async () => Contact.getAll(__CACHE.vaultPk).then(contacts => {
    //     __CACHE.contacts = contacts
    //     return __CACHE.contacts
    // }),
    // getContacts: async (force=false) => __CACHE.contacts === null || force ? 
    //     Cache._getAndSetContacts() : __CACHE.contacts,
}

Object.freeze(Cache)

// export function getContactsManager() {
//     return __CACHE.vaultManager ?
//         __CACHE.vaultManager.contactsManager : null
// }
// export function getSecretsManager() {
//     return __CACHE.vaultManager ?
//         __CACHE.vaultManager.secretsManager : null
// }
// export function getNotificationsManager() {
//     return __CACHE.vaultManager ?
//         __CACHE.vaultManager.notificationsManager : null
// }
// export function getMessagesManager() {
//     return __CACHE.vaultManager ?
//         __CACHE.vaultManager.messagesManager : null
// }

export default Cache
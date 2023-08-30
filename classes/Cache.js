import SI from './StorageInterface'
import Vault from './Vault'


const __CACHE = {
    vault_pk: '', //current vault primary key
    vault: null,
    vault_manager: null, //vault manager
}

// So that dont have to reference LocalStorage (SI.js)
const Cache = {
    setVaultAndManager: (vault, vault_manager) => {
        __CACHE.vault = vault
        __CACHE.vault_pk = vault.pk
        __CACHE.vault_manager = vault_manager
        console.log(Cache.vault_manager, 'is null')
    },
    get vault_manager() { return __CACHE.vault_manager },
    get vault_pk() { return __CACHE.vault_pk },
    get vault() { return __CACHE.vault },
    // getVault: async (force=false) => __CACHE.vault === null || force ?
    //     Cache._getAndSetVault() : __CACHE.vault,

    // _getAndSetContacts: async () => Contact.getAll(__CACHE.vault_pk).then(contacts => {
    //     __CACHE.contacts = contacts
    //     return __CACHE.contacts
    // }),
    // getContacts: async (force=false) => __CACHE.contacts === null || force ? 
    //     Cache._getAndSetContacts() : __CACHE.contacts,
}

Object.freeze(Cache)

export function getContactsManager() {
    return __CACHE.vault_manager ?
        __CACHE.vault_manager.contacts_manager : null
}
export function getSecretsManager() {
    return __CACHE.vault_manager ?
        __CACHE.vault_manager.secrets_manager : null
}

export default Cache
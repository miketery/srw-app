import SI from './StorageInterface'
import Vault from './Vault'


const __CACHE = {
    vault_pk: '', //current vault primary key
    vault: null,
    contacts: null, //contacts in vault
}

// So that dont have to reference LocalStorage (SI.js)
const Cache = {
    setVault: (vault) => {
        __CACHE.vault = vault
        __CACHE.vault_pk = vault_pk
    },
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

export default Cache
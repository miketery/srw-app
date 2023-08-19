import AsyncStorage from "@react-native-async-storage/async-storage"

const data_template = {
    initialized: false,
    default_vault: null,
    // vaults_index: [], // array of vault ids
    // objects_index: [], // array of object ids
    // contacts_index: [], // array of object ids
    // notifications_index: [], // array of object ids
    last_backup: null
}
const _data = {...data_template}
export enum StoredTypes {
    vaults = 'vaults',
    contacts = 'contacts',
    notifications = 'notifications',
    objects = 'objects',
    keyshares = 'keyshares',
    contact_keyshares = 'contact_keyshares',
}
export enum StoredTypesPrefix {
    vaults = 'v__',
    contacts = 'c__',
    notifications = 'n__',
    objects = 'o__',
    keyshares = 'k__',
    contact_keyshares = 'ck_',
}
export const TYPE_MAP = {
    'v__': StoredTypes.vaults,
    'c__': StoredTypes.contacts,
    'n__': StoredTypes.notifications,
    'o__': StoredTypes.objects,
    'k__': StoredTypes.keyshares,
    'ck_': StoredTypes.contact_keyshares,
}
export const PREFIX_TO_TYPE = {
    'v__': StoredTypes.vaults,
    'c__': StoredTypes.contacts,
    'n__': StoredTypes.notifications,
    'o__': StoredTypes.objects,
    'k__': StoredTypes.keyshares,
    'ck_': StoredTypes.contact_keyshares,
}
const prefixToType = (prefix: string): string|undefined => Object.keys(StoredTypesPrefix).find(k => StoredTypesPrefix[k] == prefix)
const typeFromPk = (pk: string): string|undefined => prefixToType(pk.slice(0,3))
const typeToPrefix = (t: string): string|undefined => Object.keys(TYPE_MAP).find(k => TYPE_MAP[k] == t)

const SI = {
    constructor: () => console.log('[SI.constructor]'),
    init: async (force=false) => {
        if(_data['initialized'] && !force)
            return
        AsyncStorage.getAllKeys().then((res) => {
            _data['initialized'] = true
            Object.keys(TYPE_MAP).map(k => {
                _data[TYPE_MAP[k]+'_index'] = res.filter(pk => pk.slice(0,2) == k)
            })
            console.log('[SI.init] complete')
            console.log(_data)
        }).catch((e) => {
            console.log(e)
            console.log('Error getting keys')
        }) 
    },
    clear: (callback) => {
        AsyncStorage.clear().then(() => {
            _data['initialized'] = false
            _data['default_vault'] = null
            callback()
        }).catch(e => console.log('Error clearing: '+e))
    },
    getCache: () => _data,
    getIndex: (t) => _data[t + '_index'],
    isInitialized: () => _data['initalized'],
    inIndex: (t, pk) => _data[t + '_index'].includes(pk),
    addToIndex: (t, pk) => !SI.inIndex(t, pk) ? 
            SI.getIndex(t).push(pk) : null,
    save: (pk, data, success: Function|null=null, error: Function|null=null) => {
        const t = typeFromPk(pk)
        console.log('[SI.save]', pk)
        AsyncStorage.setItem(pk, JSON.stringify(data))
        .then(r => {
            SI.addToIndex(t, pk)
            success!=null && success()
        }).catch(e => {
            console.error(e)
            error!=null && error()
        })
    },
    saveAsync: async(pk, data) => {
        const t = typeFromPk(pk)        
        console.log('[SI.saveAsync]', pk)
        SI.addToIndex(t, pk)
        return AsyncStorage.setItem(pk, JSON.stringify(data))
    },
    get: async(pk: string) => {
        console.log('[SI.get]', pk)
        return AsyncStorage.getItem(pk).then(r => {
            if(r == null)
                return null
            return JSON.parse(r)
        })        
    },
    delete: (pk, success: Function|null=null, error: Function|null=null) => {
        console.log('[SI.delete]', pk)
        const t = typeFromPk(pk)
        AsyncStorage.removeItem(pk).then(() => {
            SI.getIndex(t).splice(SI.getIndex(t).indexOf(pk), 1)
            if(success!=null) success()
        }).catch(e => {
            console.error(e)
            if(error!=null) error()
        })
    },
    getAll: async(t: StoredTypes, vault_pk: string|null=null) => {
        console.log('[SI.getAll]', t)
        if(vault_pk == null)
            return AsyncStorage.multiGet(SI.getIndex(t))
        const results = await AsyncStorage.multiGet(SI.getIndex(t))
        return results.map(([key, data]) => {
            try {
                return data != null ? JSON.parse(data) : null;
            } catch (error) {
                console.error(`Error parsing value for key ${key}: ${error}`);
                return null;
            }
        }).filter(obj => obj !== null && obj.vault_pk === vault_pk);
    },
}
Object.freeze(SI)

export default SI

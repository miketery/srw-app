import AsyncStorage from "@react-native-async-storage/async-storage"

export enum StoredType { 
    vault = 'vault',
    contact = 'contact',
    notification = 'notification',
    secret = 'secret',
    keyshare = 'keyshare',
    contact_keyshare = 'contact_keyshare',
}
export const StoredTypePrefix: { [k in StoredType]: string } = {
    // MUST have all the same keys as StoredType
    [StoredType.vault]: 'v__',
    [StoredType.contact]: 'c__',
    [StoredType.notification]: 'n__',
    [StoredType.secret]: 's__',
    [StoredType.keyshare]: 'k__',
    [StoredType.contact_keyshare]: 'ck_',
}
// map prefix to StoredType
//  ↳ i.e. { 'v__': StoredType.vault, 'c__': StoredType.contact, ... }
const PrefixToStoredType: { string: StoredType} = Object.fromEntries(
    Object.keys(StoredTypePrefix).map((k) => [StoredTypePrefix[k], StoredType[k]])
)
const pkToStoredType = (pk: string): StoredType => PrefixToStoredType[pk.slice(0,3)]

const state_template = {
    initialized: false,
    default_vault: null,
    last_backup: null
}
const _state = {...state_template}
const _indexes: {[k in StoredType]: string[]}= Object.fromEntries(
    Object.keys(StoredType).map((k) => [StoredType[k], []])
)

const SI = {
    constructor: () => console.log('[SI.constructor]'),
    init: async (force=false): Promise<Boolean> => {
        if(_state['initialized'] && !force)
            return true
        return AsyncStorage.getAllKeys().then((res) => {
            _state['initialized'] = true
            Object.keys(StoredType).map(k => {
                _indexes[k] = res.filter(pk => pk.slice(0,3) == StoredTypePrefix[k])
            })
            console.log('[SI.init]', _state, _indexes)
            return true
        }).catch((e) => {
            console.log(e)
            console.log('Error getting keys')
            return false
        })
    },
    clear: (callback: Function) => {
        AsyncStorage.clear().then(() => {
            _state['initialized'] = false
            _state['default_vault'] = null
            callback()
        }).catch(e => console.log('Error clearing: '+e))
    },
    // getCache: () => _state,
    getIndex: (t: StoredType) => _indexes[t],
    isInitialized: () => _state['initalized'],
    inIndex: (t: StoredType, pk: string): Boolean => SI.getIndex(t).includes(pk),
    addToIndex: (t: StoredType, pk: string) => !SI.inIndex(t, pk) ? 
            SI.getIndex(t).push(pk) : null,
    saveSync: (pk: string, data: any, success: Function|null=null, error: Function|null=null) => {
        const t = pkToStoredType(pk)
        console.log('[SI.saveAsync]', pk)
        AsyncStorage.setItem(pk, JSON.stringify(data))
        .then(r => {
            SI.addToIndex(t, pk)
            success!=null && success()
        }).catch(e => {
            console.error(e)
            error!=null && error()
        })
    },
    save: async(pk: string, data: any) => {
        const t = pkToStoredType(pk)        
        console.log('[SI.save]', pk)
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
    delete: async(pk: string) => {
        console.log('[SI.deleteAsync]', pk)
        const t = pkToStoredType(pk)
        return AsyncStorage.removeItem(pk)
    },
    deleteSync: (pk: string, success: Function|null=null, error: Function|null=null) => {
        console.log('[SI.delete]', pk)
        const t = pkToStoredType(pk)
        AsyncStorage.removeItem(pk).then(() => {
            SI.getIndex(t).splice(SI.getIndex(t).indexOf(pk), 1)
            if(success!=null) success()
        }).catch(e => {
            console.error(e)
            if(error!=null) error()
        })
    },
    getAll: async(t: StoredType, vault_pk: string|null=null) => {
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

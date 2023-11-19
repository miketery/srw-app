import AsyncStorage from "@react-native-async-storage/async-storage"

export enum StoredType { 
    vault = 'vault',
    contact = 'contact',
    notification = 'notification',
    secret = 'secret',
    recoveryPlan = 'recoveryPlan', // party (or external gaurdian) stored as child of recoveryPlan
    guardian = 'guardian', // I am a guardian for someone else (i.e. they have me as a party in their recoveryPlan)
    recoverVault = 'recoverVault', // recoverying a vault
    message = 'message',
}
export const StoredTypePrefix: { [k in StoredType]: string } = {
    // MUST have all the same keys as StoredType
    [StoredType.vault]: 'v__',
    [StoredType.contact]: 'c__',
    [StoredType.notification]: 'n__',
    [StoredType.secret]: 's__',
    [StoredType.recoveryPlan]: 'rp_',
    [StoredType.guardian]: 'g__',
    [StoredType.recoverVault]: 'rv_',
    [StoredType.message]: 'm__',
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

const SS = {
    // types: StoredType,
    // prefix: (t: StoredType) => StoredTypePrefix[t], 
    constructor: () => console.log('[SS.constructor]'),
    init: async (force=false): Promise<boolean> => {
        if(_state['initialized'] && !force)
            return true
        return AsyncStorage.getAllKeys().then((res) => {
            _state['initialized'] = true
            Object.keys(StoredType).map(k => {
                _indexes[k] = res.filter(pk => pk.slice(0,3) == StoredTypePrefix[k])
            })
            console.log('[SS.init]', _state, _indexes)
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
    inIndex: (t: StoredType, pk: string): boolean => SS.getIndex(t).includes(pk),
    addToIndex: (t: StoredType, pk: string) => !SS.inIndex(t, pk) ? 
            SS.getIndex(t).push(pk) : null,
    saveSync: (pk: string, data: any, success: Function|null=null, error: Function|null=null) => {
        const t = pkToStoredType(pk)
        console.log('[SS.saveAsync]', pk)
        AsyncStorage.setItem(pk, JSON.stringify(data))
        .then(r => {
            SS.addToIndex(t, pk)
            success!=null && success()
        }).catch(e => {
            console.error(e)
            error!=null && error()
        })
    },
    save: async(pk: string, data: any) => {
        const t = pkToStoredType(pk)        
        console.log('[SS.save]', pk)
        SS.addToIndex(t, pk)
        return AsyncStorage.setItem(pk, JSON.stringify(data))
    },
    get: async(pk: string) => {
        console.log('[SS.get]', pk)
        return AsyncStorage.getItem(pk).then(r => {
            if(r == null)
                return null
            return JSON.parse(r)
        })        
    },
    delete: async(pk: string) => {
        console.log('[SS.deleteAsync]', pk)
        const t = pkToStoredType(pk)
        return AsyncStorage.removeItem(pk)
    },
    deleteSync: (pk: string, success: Function|null=null, error: Function|null=null) => {
        console.log('[SS.delete]', pk)
        const t = pkToStoredType(pk)
        AsyncStorage.removeItem(pk).then(() => {
            SS.getIndex(t).splice(SS.getIndex(t).indexOf(pk), 1)
            if(success!=null) success()
        }).catch(e => {
            console.error(e)
            if(error!=null) error()
        })
    },
    getAll: async(t: StoredType, vaultPk: string|null=null) => {
        console.log('[SS.getAll]', t)
        const results = await AsyncStorage.multiGet(SS.getIndex(t))
        const array = results.map(([key, data]) => {
            try {
                return data != null ? JSON.parse(data) : null;
            } catch (error) {
                console.error(`Error parsing value for key ${key}: ${error}`);
                return null;
            }
        })
        return vaultPk === null ? array : array.filter(obj => obj !== null && obj.vaultPk === vaultPk);
    },
    deleteAllByType: async(t: StoredType) => {
        // should only be relevant for testing / dev
        console.log('[SS.deleteAllByType]', t)
        const keys = SS.getIndex(t)
        return AsyncStorage.multiRemove(keys)
    }
}
Object.freeze(SS)

export default SS

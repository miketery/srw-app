import AsyncStorage from "@react-native-async-storage/async-storage"

const data_template = {
    initialized: false,
    default_vault: null,
    // vaults_index: [], // array of vault ids
    // wallets_index: [], // array of wallet ids
    // objects_index: [], // array of object ids
    // contacts_index: [], // array of object ids
    // notifications_index: [], // array of object ids
    last_backup: null
}
const _data = {...data_template}

export const TYPE_MAP = {
    'v_': 'vaults',
    'c_': 'contacts',
    'n_': 'notifications',
    'o_': 'objects',
    'k_': 'keyshares',
    'Ck': 'contact_keyshares',
}
const typeFromPk = (pk) => TYPE_MAP[pk.slice(0,2)]
const typeToPrefix = (t) => Object.keys(TYPE_MAP).find(k => TYPE_MAP[k] == t)

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
    save: (pk, data, success=null, error=null) => {
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
    get: async(pk) => {
        console.log('[SI.get]', pk)
        return AsyncStorage.getItem(pk).then(r => {
            return JSON.parse(r)
        })        
    },
    delete: (pk, success=null, error=null) => {
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
    getAll: async(t, vault_pk=null) => {
        console.log('[SI.getAll]', t)
        if(vault_pk == null)
            return AsyncStorage.multiGet(SI.getIndex(t))
        let arr = await AsyncStorage.multiGet(SI.getIndex(t))
        return arr.map(a => JSON.parse(a[1])).filter(a => 
            a !== null && 'vault_pk' in a && a.vault_pk == vault_pk)
    },
}
Object.freeze(SI)

export default SI

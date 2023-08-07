import axios from "axios"
import base58 from "bs58"

const base64 = require('base64-js')

import AsyncStorage from "@react-native-async-storage/async-storage"
import { MESSAGE_GET_ENDPOINT, MESSAGE_OPENED_ENDPOINT } from "../config"
import { open_sealed_box } from "../lib/utils"
import SI, { TYPE_MAP } from "./SI"
import Notification from "./Notification"
import { process_contact_accept } from "./Contact"
import { process_keyshare_accept } from './KeyShare'
import { process_wallet_accept } from "./SmartWallet"

const type_names = [
    'contact_accept', 'contact_request',
    'keyshare_accept', 'keyshare_request',
    'wallet_invite', 'wallet_accept',
    'message'
]

export const notification_template = {
    last_pulled_ts: 0,
    last_id: 0,
    notifications: {},
    count: 0,
    message: {}, 
    message_count: 0,
}
const _n = {
    ...notification_template
}

const NI = {
    // fetch from server
    init: async(vault_pk) => {
        return SI.getAll('notifications', vault_pk).then(items => {
            items.forEach(item => {
                let x = new Notification()
                x.fromDict(item)
                _n['notifications'][x['pk']] = x
            })
            return _n
        })
    },
    getCached: () => {
        return _n
    },
    getFromServer: async(vault) => {
        // console.log('[NI.getFromServer]', vault.verifyKeyBase58())
        const payload = {
            last_id: _n['last_id'],
        }
        // console.log(payload)
        const signed_payload = vault.createSignedPayload(payload)        
        return axios.post(MESSAGE_GET_ENDPOINT, signed_payload)
        .then(response => {
            console.log('[NI.getFromServer] success fetching:', response.data.length)
            return response.data
        }).then(notifications => {
            _n['last_pulled_ts'] = Math.round(Date.now()/1000)
            let out = []
            notifications.map(n => {
                // if not in index, save to storage and mark receipt,
                // if in index still mark receipt (TODO)
                if(!SI.inIndex(TYPE_MAP['n_'], 'n_'+n['id'])) {
                    console.log(n)
                    let tmp = Notification.fromServer(vault, n)
                    out.push(
                        tmp.decrypt(vault).then(x => {
                            _n['notifications'][x.pk] = x
                            console.log(_n)
                            if(x.type_name == 'contact_accept')
                                process_contact_accept(x)
                            if(x.type_name == 'keyshare_accept')
                                process_keyshare_accept(x)
                            if(x.type_name == 'wallet_accept')
                                process_wallet_accept(x)
                        }).catch(e => console.log(e))
                    )
                }
            })
            return Promise.all(out)
        }).then(() => {
            return _n
        }).catch(e => { // includes failed connection
            console.error('[NI.getFromServer] error', e)
            return _n
        })
    },
    getCount: () => Object.keys(_n['notifications']).length, 
    deleteNotification: async(pk, success=null) => {
        delete _n['notifications'][pk]
        SI.delete(pk, success)
        return _n
    },
}
Object.freeze(NI)

export default NI

// function markOpened(vault, ids) {
//     console.log('markOpened' + ids)
//     let signed_ts = vault.getSignedTS()
//     let data = {
//         verify_key: base58.encode(vault.verify_key),
//         signed_ts: base58.encode(signed_ts),
//         ids: ids,
//     }
//     fetch(MESSAGE_OPENED_ENDPOINT, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify(data)
//     }).then(response => {
//         console.log('success getting notifications')
//         return response.json()
//     }).then(data => {
//         console.log(data)
//     }).catch(e => {
//         console.log('error marking messages open: '+e)
//         console.log(ids)
//     })
// }
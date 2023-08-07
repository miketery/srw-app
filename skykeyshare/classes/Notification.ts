import base58 from 'bs58'
const base64 = require('base64-js')

import AsyncStorage from "@react-native-async-storage/async-storage"

import { open_sealed_box, bytesToHex, open_box } from "../lib/utils"
import SI from './SI'
import Vault from './Vault'
import { DEBUG } from '../config'

const ContactBasedNotifications = [
    'keyshare_request'
    ,'keyshare_accept'
    // for multi party wallet
    ,'wallet_invite'
    ,'wallet_accept'
    // for multi party tx create
    ,'transaction_request'
    ,'transaction_signed'
    // for multi part deposit
    ,'deposit_request'
    ,'deposit_signed'
    // for single wallet
    ,'invoice_request'
    ,'invoice_signed'

]

export default class Notification {
    pk: string
    created: number
    data: any
    type_name: string
    type_version: number
    
    public_key: Uint8Array
    verify_key: Uint8Array // my vault verify_key

    vault_pk: string // ("v_{verify_key}")
    decrypted = false

    name_if_contact: string
    
    constructor() {
    }
    static fromServer(vault: Vault, data: any): Notification {
        let n = new Notification()
        let verify_key = data['verify_key']
        if(verify_key != vault.verifyKeyBase58())
            throw('Error processing notification for this vault, verify_key mismatch')
        n.vault_pk = vault.pk
        n.public_key = base58.decode(data['public_key'])
        n.type_name = data['type_name']
        n.type_version = data['type_version']
        n.pk = 'n_' + data['uuid']
        n.data = base64.toByteArray(data['data'])
        n.created = data['created']
        return n
    }
    async getDecryptionKey(vault: Vault): Promise<[Uint8Array, Uint8Array | null]> {
        // if vault level get normal private key
        // contact level get contact private key
        return bytesToHex(this.public_key) == bytesToHex(vault.public_key) ?
        [new Uint8Array(vault.private_key), null]
        : AsyncStorage.getItem('c_'+base58.encode(this.public_key)).then(d => {
                if(d==null)
                    throw('Error getting contact with said private key')
                let x = JSON.parse(d)
                this.name_if_contact = x['name']
                return [base58.decode(x['private_key']), base58.decode(x['their_public_key'])]
            })
    }
    async decrypt(vault: Vault, save=true): Promise<Notification | void> {
        return this.getDecryptionKey(vault).then(keys => {
            let private_key = keys[0]
            let public_key = keys[1]
            // console.log('[Notification.decyprtion] private_key: '+base58.encode(private_key))
            // console.log('[Notification.decyprtion] public_key: '+base58.encode(public_key))
            let decrypted = this.isContactBased() ?
                open_box(this.data, public_key, private_key) : 
                open_sealed_box(this.data, private_key)
            if(decrypted == null)
                throw('Error decrypting this bad boy')
            const decoder = new TextDecoder()
            let decoded = JSON.parse(decoder.decode(decrypted))
            console.log(decoded)
            if(decoded['type_name'] == this.type_name) {
                console.log('[Notification.decrypt] success')
                this.data = decoded
                this.decrypted = true
                if(save)
                    this.save()
                return this
            }
        }).catch(e => {
            console.error('[Notification.decrypt] error: '+e)
        })
    }
    isContactBased() {
        return ContactBasedNotifications.includes(this.type_name)
    }
    async save(): Promise<void> {
        return SI.saveAsync(this.pk, this.toDict())
    }
    toDict(): any {
        return {
            pk: this.pk,
            created: this.created,
            data: this.data,
            vault_pk: this.vault_pk,
            public_key: base58.encode(this.public_key),
            type_name: this.type_name,
            type_version: this.type_version,
            decrypted: this.decrypted,
            name_if_contact: this.name_if_contact,
        }
    }
    static async load(pk: string): Promise<Notification> {
        console.log('[Notification.load]', pk)
        return SI.get(pk).then(data => {
            let n = new Notification()
            n.fromDict(data)
            return n
        })
    }
    static async getAll(vault_pk: string): Promise<Notification[]> {
        return SI.getAll('notifications', vault_pk).then(data => {
            return data.map(n => {
                let notification = new Notification()
                notification.fromDict(n)
                return notification
            })
        })
    }
    fromDict(data: any): void {
        console.log('[Notification.fromDict]', data['pk'])
        DEBUG && console.log(data)
        this.pk = data['pk']
        this.created = data['created']
        this.vault_pk = data['vault_pk']
        this.public_key = base58.decode(data['public_key'])
        this.type_name = data['type_name']
        this.type_version = data['type_version']
        this.decrypted = data['decrypted']
        this.data = data['data']
        this.name_if_contact = data['name_if_contact']
    }
}
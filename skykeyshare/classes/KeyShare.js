import base58 from 'bs58'
const base64 = require('base64-js')

import { v4 as uuidv4 } from 'uuid'
import { bytesToHex, hexToBytes, trim_and_lower,
    hash, getRandom, shamirSplit, secret_box
} from '../lib/utils'
import Contact from './Contact'
import { KeyShareMessage, MessageOut } from './Message'
import SI from './SI'

export const KEYSHARE_STATE = {
    'INIT': 0,
    'CONFIRMED': 1,
    'SENT': 2,
    'CLEANED': 3,
}

export class Share { //share
    value = null
    hash = null

    constructor(value) {
        this.value = value
        this.hash = hash(value)
    }
    clean() {
        this.value = null
    }
    isClean() {
        return this.value == null && this.hash != null
    }
    toDict() {
        return {
            value: this.isClean() ? null : bytesToHex(this.value),
            hash: bytesToHex(this.hash)
        }
    }
}


export class Guardian { // Trusted entity that will hold one or more shares
    name = null
    verify_key = null //bytes
    public_key = null // bytes
    email = null
    phone = null
    // manifest = false // will get copy of manifest
    // create & updated
    share_count = 1
    shares = []
    sent = false
    receipt = false

    constructor(name, verify_key=null, public_key=null, email=null, phone=null) {
        this.name = name
        this.verify_key = verify_key
        this.public_key = public_key
        this.email = email
        this.phone = phone
        // TODO custom notes?
    }
    static fromDict(data) {
        let g = new Guardian(
            data['name'],
            base58.decode(data['verify_key']),
            base58.decode(data['public_key']),
            data['email'],
            data['phone'])
        g.share_count = data['share_count']
        g.sent = data['sent']
        g.receipt = data['receipt']
        for(let i=0; i<data['shares'].length; i++)
            g.shares.push(new Share(
                hexToBytes(data['shares'][i]['value']),
                bytesToHex(data['shares'][i]['hash'])
            ))
        return g
    }
    conflictsWith(guardian) {
        // check if name is the same or verify_key is the same
        return trim_and_lower(this.name) == trim_and_lower(guardian.name)
            || bytesToHex(this.verify_key) == bytesToHex(guardian.verify_key)
    }
    clean() {
        for(let i=0; i < this.shares.length; i++) {
            this.shares[i].clean()
        }
    }
    isClean() {
        for(let i=0; i < this.shares.length; i++)
            if(!this.shares[i].isClean())
                return false
        return true
    }
    addShare() { // increment
        this.share_count = Math.min(this.share_count + 1, 5)
    }
    removeShare() { // decrement
        this.share_count = Math.max(1, this.share_count - 1)
    }
    assignShare(key) {
        this.shares.push(new Share(key))
    }
    manifest() {
        return {
            name: this.name,
            email: this.email,
            phone: this.phone,
            verify_key: base58.encode(this.verify_key),
            // public_key: base58.encode(this.public_key),
            share_count: this.share_count,
            share_hashes: this.shares.map(s => bytesToHex(s.hash))
        }
    }
    toDict() {
        return {
            name: this.name,
            email: this.email,
            phone: this.phone,
            verify_key: base58.encode(this.verify_key),
            public_key: base58.encode(this.public_key),
            share_count: this.share_count,
            shares: this.shares.map(s => s.toDict()),
            sent: this.sent,
            receipt: this.receipt,
        }
    }
    async sendShares(manifest, encrypted_payload, vault) {
        // get contact, send share to them
        let c = await Contact.load('c_'+base58.encode(this.public_key))
        let data = {
            manifest: manifest,
            encrypted_payload: encrypted_payload,
            shares: this.shares.map(s => s.toDict()),
            type_name: 'keyshare_request'
        }
        let m = new MessageOut(data, c)
        return m.send(vault).then(response => {
            if(response['status'] == 201) {
                this.sent = true
                return true
            }
            return false
        })
    }
}

export class KeyShare {
    // for creating a recovery network and sending shares
    pk = null
    vault_pk = null
    created = null
    updated = null
    hash = [] //hash(salt + vault_pk) 

    state = KEYSHARE_STATE.INIT // init, confirmed, sent, cleaned
    step = 1
    // will be shared with everyone
    name = null
    notes = null
    threshold = 2 // integer
    guardians = [] // list of guardians
    
    key = [] // bytes
    payload = null // bytes
    encrypted_payload = null // bytes
    
    cleaned = false // whether private keys deleted

    constructor() {}
    static create(vault, name=null, notes=null) {
        let k = new KeyShare()
        k.vault_pk = vault.pk
        k.name = name
        k.notes = notes
        k.pk = 'k_' + uuidv4()
        k.created = Date.now()
        k.updated = k.created
        return k
    }
    static async load(pk) {
        let k = new KeyShare()
        console.log('[KeyShare.load] '+pk)
        const data = await SI.get(pk)
        if(data == null) {
            throw Error('KeyShare not found, '+pk)
        }
        k.fromDict(data)
        return k;
    }
    fromDict(data) {
        try {
            this.pk = data['pk']
            this.vault_pk = data['vault_pk']
            this.key = hexToBytes(data['key'])
            this.hash = hexToBytes(data['hash'])
            this.name = data['name']
            this.state = data['state']
            this.notes = data['notes']
            this.step = data['step']
            this.updated = data['updated']
            this.created = data['created']
            this.payload = data['payload']
            this.encrypt_payload = data['encrypted_payload']
            this.cleaned = data['cleaned']
            for(let i=0; i < data['guardians'].length; i++)
                this.guardians.push(Guardian.fromDict(data['guardians'][i]))
        } catch(e) {
            throw TypeError('loading fromDict')
        }
    }
    toDict() {
        return {
            pk: this.pk,
            vault_pk: this.vault_pk,
            hash: bytesToHex(this.hash),
            key: bytesToHex(this.key),
            name: this.name,
            notes: this.notes,
            step: this.step,
            updated: this.updated,
            created: this.created,
            payload: this.payload,
            encrypted_payload: this.encrypted_payload,
            threshold: this.threshold,
            guardians: this.guardians.map(g => g.toDict()),
            cleand: this.cleaned,
            state: this.state,
        }
    }
    manifest() {
        return {
            pk: this.pk,
            hash: bytesToHex(this.hash),
            name: this.name,
            notes: this.notes,
            threshold: this.threshold,
            share_count: this.shareCount(),
            guardians: this.guardians.map(g => g.manifest())
        }
    }
    setPayload(payload) {
        console.log(payload)
        // check is dict and has 
        if('object' !== typeof payload)
            throw new TypeError('Expecting object for payload.')
        if('string' !== typeof payload.type)
            throw new TypeError('Expecting type in payload.')
        if(!['seed'].includes(payload.type)) //initially vault seed
            throw new TypeError('Expecting type for seed only')
        this.payload = payload
    }
    addGuardian(guardian) {
        // check said guardian name doesn't already exist
        // and no ident (contact) conflict
        for(let i=0; i < this.guardians.length; i++)
            if(this.guardians[i].conflictsWith(guardian))
                return false
                //throw new Error('Guardian name or verify_key matches another in the set')
        this.guardians.push(guardian)
    }
    verify_keyInSet(verify_key) {
        for(let i = 0; i < this.guardians.length; i++) {
            if(base58.encode(this.guardians[i].verify_key) == verify_key)
                return true
        }
        return false
    }
    guardianInSet(guardian) {
        return this.guardians.filter(g => g.conflictsWith(guardian)).length == 1
    }
    removeGuardian(guardian) {
        this.guardians = this.guardians.filter(g => base58.encode(g.verify_key) != base58.encode(guardian.verify_key))
    }
    guardianAccepted(verify_key) {
        let guardian = this.guardians.filter(g => base58.encode(g.verify_key) == verify_key)
        if(guardian.length==1)
            guardian[0].receipt = true
        else
            throw('Could not find guardian')
    }
    setThreshold(threshold) {
        if(threshold >= 2 & threshold <= this.shareCount())
            this.threshold = threshold
        else {
            throw new Error('Threshold needs to be between 2 and ' + this.guardianCount() + ' (total Guardian count)')
        }
    }
    sentCount() {
        return this.guardians.filter(g => g.sent === true).length
    }
    shareCount() {
        return this.guardians.reduce( (s, g) => s + g.share_count, 0)
    }
    guardianCount() {
        return this.guardians.length
    }
    async generateKey() {
        this.key = await getRandom(32)
        console.log('[KeyShare.generateKey] '+bytesToHex(this.key))
    }
    encryptPayload() {
        console.log('[KeyShare.encryptPayload]')
        const encoder = new TextEncoder()
        let encoded = encoder.encode(JSON.stringify(this.payload))
        let encrypted = secret_box(encoded, this.key)
        this.hash = hash(encrypted)
        this.encrypted_payload = base64.fromByteArray(encrypted)
    }
    splitKey() {
        console.log('[KeyShare.splitKey]')
        let shares = shamirSplit(this.key, this.shareCount(), this.threshold)
        for(let i = 0; i < this.guardianCount(); i++) {
            this.guardians[i].shares = [] // reset shares if we're splitting key
            for(let j = 0; j < this.guardians[i].share_count; j++)
                this.guardians[i].assignShare(shares.shift())
        }
    }
    async confirm() {
        if(this.state >= KEYSHARE_STATE.CONFIRMED)
            return callback() 
        await this.generateKey()
        this.encryptPayload()
        this.splitKey()
        this.state = KEYSHARE_STATE.CONFIRMED
        this.save(() => console.log('[KeyShare.confirm] save'))
    }
    clean() {
        this.key = null
        this.payload = null
        this.guardians.forEach(g => g.clean())
        this.state = KEYSHARE_STATE.CLEANED
    }
    save(callback) {
        SI.save(this.pk, this.toDict(), callback)
    }
    async sendShares(vault) {
        if(this.state != KEYSHARE_STATE.CONFIRMED)
            throw 'Trusted Recovery is not in confirmed state, go back and try again'
        if(this.sentCount() == this.guardianCount())
            return console.log('Already sent shares to all guardians')
        let manifest = this.manifest()
        return Promise.all(this.guardians.filter(
            g => g.sent === false).map(
                g => g.sendShares(manifest, this.encrypted_payload, vault)))
    }
}
export class ContactKeyShare {
    pk = null
    vault_pk = null
    contact_pk = null
    manifest = {}
    shares = []
    constructor() {}
    static create(contact_pk, vault_pk, data) {
        let cks = new ContactKeyShare()
        cks.contact_pk = contact_pk
        cks.vault_pk = vault_pk
        cks.manifest = data.manifest
        cks.shares = data.shares
        cks.pk = 'Ck' + uuidv4()
        return cks
    }
    static async load(pk) {
        let cks = new ContactKeyShare()
        console.log('[ContactKeyShare.load] '+pk)
        const data = await SI.get(pk)
        cks.fromDict(data)
        return cks
    }
    fromDict(data) {
        this.pk = data['pk']
        this.vault_pk = data['vault_pk']
        this.contact_pk = data['contact_pk']
        this.manifest = data['manifest']
        this.shares = data['shares']
    }
    toDict() {
        return {
            vault_pk: this.vault_pk,
            pk: this.pk,
            contact_pk: this.contact_pk,
            manifest: this.manifest,
            shares: this.shares,
        }
    }
    save(callback) {
        SI.save(this.pk, this.toDict(), callback)
    }
}

export async function process_keyshare_request(keyshare_request, vault, callback, error_callback) {
    // keyshare request inbound to store for future recovery
    console.log('[process_keyshare_request]')
    let contact_pk = 'c_'+base58.encode(keyshare_request['public_key'])
    let contact_keyshare = ContactKeyShare.create(contact_pk,
        keyshare_request['vault_pk'],
        keyshare_request['data'])
    let c = await Contact.load(contact_pk)
    let data = {
        type_name: 'keyshare_accept',
        pk: contact_keyshare.manifest['pk'],
        verify_key: keyshare_request['vault_pk'].slice(2)
    }
    let m = new MessageOut(data, c)
    return m.send(vault).then(response => {
        if(response['status'] == 201) {
            contact_keyshare.save(callback)            
        }
    }).catch(e => {
        console.log('[process_keyshare_request] error: '+e)
        error_callback(e)
    })
}

export async function process_keyshare_accept(keyshare_accept) {
    // accepted keyshare from trusted contact
    console.log('[process_keyshare_accept]')
    console.log(keyshare_accept)
    try {
        let ks = await KeyShare.load(keyshare_accept['data']['pk'])
        ks.guardianAccepted(keyshare_accept['data']['verify_key'])
        ks.save(() => console.log('[process_keyshare_accept] saved ks: '+
            keyshare_accept['data']['pk']+', for guardian: '+keyshare_accept['data']['verify_key'])
        )
    } catch (e) {
        console.log(e.message)
        return
    }
}
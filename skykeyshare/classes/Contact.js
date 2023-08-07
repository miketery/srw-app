import { v4 as uuidv4 } from 'uuid';

import Cache from './Cache';
import SI from './SI'
import { bytesToHex, hexToBytes, 
    generate_curve25519_keypair, 
    sealed_box, sign_msg, verify_msg, joinByteArrays } from '../lib/utils'
import binaryToBase64 from 'react-native/Libraries/Utilities/binaryToBase64'

import { MESSAGE_POST_ENDPOINT } from '../config'
import base58 from 'bs58'
import axios from 'axios'

//TODO: use https://github.com/ajv-validator/ajv or similar
//      for schema validation & serialization

export default class Contact {
    pk = null //c_{uuidv4}
    vault_pk = null //v_{base58public_key}
    name = null // str
    short_code = null // str
    notes = null // str
    
    // [byte]
    private_key = []
    public_key = []
    public_key_signature = []
    their_verify_key = []
    their_public_key = []

    state = 0 // Initial, Accepted

    constructor() {

    }
    static async load(pk) {
        let contact = new Contact()
        console.log('[Contact.load] '+pk)
        const data = await SI.get(pk)
        contact.fromDict(data)
        return contact;
    }
    static async getAll(vault_pk) {
        return SI.getAll('contacts', vault_pk).then(data => {
            return data.map(c => {
                let contact = new Contact()
                contact.fromDict(c)
                return contact
            })
        })
    }
    static async getByVerifyKey(verify_key) {
        const contacts = await Cache.getContacts()
        return contacts.find(c => c.verifyKeyBase58() === verify_key)
    }
    fromDict(data) {
        this.pk = data['pk']
        this.vault_pk = data['vault_pk']
        this.name = data['name']
        this.short_code = data['short_code'] || ''
        this.state = data['state']
        this.notes = data['notes']
        this.private_key = base58.decode(data['private_key'])
        this.public_key = base58.decode(data['public_key'])
        this.their_verify_key = base58.decode(data['their_verify_key'])
        this.their_public_key = base58.decode(data['their_public_key'])
    }
    static create(name, their_verify_key, their_public_key, notes, vault) {
        let contact = new Contact()
        contact.vault_pk = vault.pk
        contact.name = name
        contact.their_verify_key = their_verify_key
        contact.their_public_key = their_public_key
        contact.notes = notes
        // key pair (curve25519)
        let keypair = generate_curve25519_keypair()
        contact.public_key = keypair.publicKey
        contact.private_key = keypair.secretKey
        contact.public_key_signature = sign_msg(contact.public_key, vault.signing_key).slice(0, 64)
        contact.pk = contact.getPk()
        return contact
    }
    verifyKeyBase58() {
        return base58.encode(this.their_verify_key)
    }
    publicKeyBase58() {
        return base58.encode(this.public_key)
    }
    getPk() {
        return 'c_' + this.publicKeyBase58()
    }
    toDict() {
        return {
            vault_pk: this.vault_pk,
            pk: this.pk,
            name: this.name,
            short_code: this.short_code,
            state: this.state,
            notes: this.notes,
            // this
            private_key: base58.encode(this.private_key),
            public_key: base58.encode(this.public_key),
            // theirs
            their_verify_key: base58.encode(this.their_verify_key),
            their_public_key: base58.encode(this.their_public_key),
        }
    }
    delete(callback) {
        SI.delete(this.pk, callback)
    }
    save(callback=null) {
        SI.save(this.getPk(), this.toDict(), callback)
    }
    update(name, notes) {
        this.name = name
        this.notes = notes
        // this.updated = Date.now()
    }
    make_contact_request(my_name='', vault, callback, error_callback) {
        console.log('Contact.make_contact_request')
        const data = {
            type_name: 'contact_request',
            name: my_name,
            // msg: msg, 
            verify_key: base58.encode(vault.verify_key),
            vault_public_key: base58.encode(vault.public_key),
            public_key: {
                curve25519: base58.encode(this.public_key),
                signature: base58.encode(this.public_key_signature)
            }
        }
        console.log(data)
        const encoder = new TextEncoder()
        const encrypted = sealed_box(encoder.encode(JSON.stringify(data)), this.their_public_key)
        const payload = {
            type_name: 'contact_request',
            type_version: '1.0.0',
            data: binaryToBase64(encrypted),
            public_key: base58.encode(this.their_public_key),
            verify_key: base58.encode(this.their_verify_key)
        }
        console.log(payload)
        const signed_payload = vault.createSignedPayload(payload)
        axios.post(MESSAGE_POST_ENDPOINT, signed_payload)
            .then(() => callback())
            .catch(error_callback)
    }
    process_contact_accept(their_public_key) {
        this.their_public_key = their_public_key
        this.state = 1
    }
}

function make_contact_accept(contact, vault, callback, error_callback) {
    console.log('make_contact_accept: ', contact.pk)
    const data = {
        type_name: 'contact_accept',
        verify_key: base58.encode(vault.verify_key),
        public_key: {
            curve25519: base58.encode(contact.public_key),
            signature: base58.encode(contact.public_key_signature)
        }
    }
    console.log(data)
    const encoder = new TextEncoder()
    const encrypted = sealed_box(encoder.encode(JSON.stringify(data)), contact.their_public_key)
    const payload = {
        type_name: 'contact_accept',
        type_version: '1.0.0',
        data: binaryToBase64(encrypted),
        public_key: base58.encode(contact.their_public_key),
        verify_key: base58.encode(contact.their_verify_key)
    }
    console.log(payload)
    const signed_payload = vault.createSignedPayload(payload)
    axios.post(MESSAGE_POST_ENDPOINT, signed_payload)
        .then(() => callback())
        .catch(error_callback)
}

export function process_contact_request(contact_request, vault, callback, error_callback) {
    console.log('process_contact_request')
    let data = contact_request['data']
    let name = data['name']
    console.log(data)
    let their_verify_key = base58.decode(data['verify_key'])
    let their_public_key = base58.decode(data['public_key']['curve25519'])
    let signature = base58.decode(data['public_key']['signature'])
    let signed = joinByteArrays(signature, their_public_key)
    let verified = verify_msg(signed, their_verify_key)
    console.log(bytesToHex(verified))
    console.log(bytesToHex(their_public_key))
    if(bytesToHex(verified) == bytesToHex(their_public_key))
        console.log('success veirfying signature')
    else {
        console.error('failed to verify signatrue')
    }
    let contact = Contact.create(name, their_verify_key, their_public_key, null, vault)
    make_contact_accept(contact, vault, () => {
        contact.state = 1
        contact.save(() => console.log('success saving accepted contact'))
        callback(contact)
    }, error_callback)
}

export function process_contact_accept(contact_accept) {
    console.log('process_contact_request')
    let data = contact_accept['data']
    console.log(data)
    let their_verify_key = base58.decode(data['verify_key'])
    let their_public_key = base58.decode(data['public_key']['curve25519'])
    let signature = base58.decode(data['public_key']['signature'])
    let signed = joinByteArrays(signature, their_public_key)
    let verified = verify_msg(signed, their_verify_key)
    console.log(bytesToHex(verified))
    console.log(bytesToHex(their_public_key))
    if(bytesToHex(verified) == bytesToHex(their_public_key))
        console.log('success veirfying signature')
    else {
        console.error('failed to verify signatrue')
    }
    Contact.load('c_'+base58.encode(contact_accept['public_key'])).then(contact => {
        if(bytesToHex(their_verify_key) != bytesToHex(contact.their_verify_key))
            return console.error('cant proces contact_accept for '+contact_accept['pk'])
        contact.process_contact_accept(their_public_key)
        contact.save(() => console.log('saved contact after process accept'))
    })
}
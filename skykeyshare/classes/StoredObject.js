import { v4 as uuidv4 } from 'uuid'

import SI from './SI'
import { bytesToHex } from '../lib/utils'


export default class StoredObject {
    pk = null
    name = null
    description = null
    data = null
    updated = null
    created = null
    vault_pk = null
    hash = null

    constructor() {

    }
    static async load(pk) {
        console.log('[StoredObject.load] '+pk)
        let stored_object = new StoredObject()
        const data = await SI.get(pk)
        stored_object.fromDict(data)
        return stored_object 
    }
    updated_format(format=null) {
        return new Date(this.updated).toLocaleString('en-US')
    } 
    created_format(format=null) {
        return new Date(this.created).toLocaleString('en-US')
    }
    fromDict(data) {
        this.pk = data['pk']
        this.name = data['name']
        this.description = data['description']
        this.data = data['data']
        this.vault_pk = data['vault_pk']
        this.updated = data['updated']
        this.created = data['created']
        this.hash = data['hash']
    }
    static create(name, description, data, vault) {
        let stored = new StoredObject()
        stored.name = name
        stored.description = description
        stored.data = data
        stored.vault_pk = vault.pk
        stored.created = Date.now()
        stored.updated = stored.created
        stored.generatePk()
        stored.generateHash()
        return stored
    }
    generateHash() {
        this.hash = 'hash' //TODO
    }
    generatePk() {
        // TODO check that doesn't already exist (super unlikely...)
        if(this.pk === null) {
            this.pk = 'o_' + uuidv4()
            console.log('StoredObject.generatePk: ' + this.pk)
        } else {
            console.warn('pk already set... ' + this.pk)
        }
    }
    toDict() {
        return {
            pk: this.pk,
            name: this.name,
            description: this.description,
            data: this.data,
            updated: this.updated,
            created: this.created,
            vault_pk: this.vault_pk,
            // hash: bytesToHex(this.hash),
        }
    }
    delete(callback) {
        SI.delete(this.pk, callback)
    }
    save(callback) {
        SI.save(
            this.pk, this.toDict(), callback)
    }
    update(name, description, data) {
        this.name = name
        this.description = description
        this.data = data
        this.updated = Date.now()
    }
}
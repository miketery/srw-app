import base58 from 'bs58'

import { PublicKey, VerifyKey } from '../lib/nacl'
import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault'
import RecoverSplit from '../models/RecoverSplit'
import { RecoverSplitResponse } from '../models/MessagePayload'
import { Message } from '../models/Message'
import ContactsManager from './ContactsManager'
import Contact from '../models/Contact'
import TypeManager from './TypeManager'

class RecoverSplitsManager extends TypeManager<RecoverSplit> {
    private _contactsManager: ContactsManager;

    constructor(vault: Vault, recoverSplits: {[pk: string]: RecoverSplit} = {},
            contactsManager: ContactsManager) { 
        console.log('[RecoverSplitsManager.constructor] ' + vault.pk)
        super(vault, recoverSplits, StoredType.recoverSplit, RecoverSplit)
        this._contactsManager = contactsManager;
    }
    get contactsManager(): ContactsManager { return this._contactsManager; }
    async createRecoverSplit(name: string, description: string): Promise<RecoverSplit> {
        const recoverSplit = RecoverSplit.create(name, description,
            this.vault, this._contactsManager.getContact) // auto saves in FSM
        await this.save(recoverSplit);
        return recoverSplit
    }
    async load(): Promise<{[pk: string]: RecoverSplit}> {
        const recoverSplits: {string?: RecoverSplit} = {};
        const recoverSplitsData = await SS.getAll(
            StoredType.recoverSplit, this.vault.pk);
        for (let recoverSplitData of Object.values(recoverSplitsData)) {
            const c = RecoverSplit.fromDict(recoverSplitData, this.vault,
                this._contactsManager.getContact);
            recoverSplits[c.pk] = c;
        }
        this.setAll(recoverSplits)
        return recoverSplits;
    }
    saveRecoverSplit = this.save
    loadRecoverSplits = this.load
    deleteRecoverSplit = this.delete
    getRecoverSplit = this.get
    getRecoverSplits = this.getAll
    getRecoverSplitsArray = this.getAllArray

    //
    async submitRecoverSplit(recoverSplit: RecoverSplit, callback: () => void): Promise<void> {
        console.log('[RecoverSplitsManager.submitRecoverSplit]', recoverSplit.name)    
        recoverSplit.fsm.send('SUBMIT', {callback})
    }
    // flows
    async processRecoverSplitResponse(message: Message, callback?: () => void)
            : Promise<{recoverSplit: RecoverSplit, contact: Contact, accepted: boolean}> {
        console.log('[RecoverSplitsManager.processRecoverSplitResponse]', message)
        const contact = this._contactsManager.getContactByDid(message.sender.did)
        message.decrypt(contact.private_key)
        const payload = message.getData() as RecoverSplitResponse
        const recoverSplit: RecoverSplit = this.getRecoverSplit(payload.recoverSplitPk)
        const party = recoverSplit.recoverSplitPartys.filter(rp => rp.contactPk === contact.pk)[0]
        let accepted = false
        if(payload.response === 'accept') {
            party.fsm.send('ACCEPT', {callback})
            accepted = true
        } else if (payload.response === 'decline') {
            party.fsm.send('DECLINE', {callback})
        }
        return {recoverSplit, contact, accepted}
    }
}

export default RecoverSplitsManager;

import base58 from 'bs58'

import { PublicKey, VerifyKey } from '../lib/nacl'
import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault'
import RecoverSplit from '../models/RecoverSplit'
import { RecoverSplitResponse } from '../models/MessagePayload'
import { Message } from '../models/Message'
import ContactsManager from './ContactsManager'
import Contact from '../models/Contact'

class RecoverSplitsManager {
    private _vault: Vault;
    private _recoverSplits: {string?: RecoverSplit}
    private _contactsManager: ContactsManager;

    constructor(vault: Vault, recoverSplits: {[pk: string]: RecoverSplit} = {},
            contactsManager: ContactsManager) { 
        console.log('[RecoverSplitsManager.constructor] ' + vault.pk)
        this._vault = vault;
        this._recoverSplits = recoverSplits;
        this._contactsManager = contactsManager;
    }
    get contactsManager(): ContactsManager { return this._contactsManager; }
    clear() { this._recoverSplits = {}; }
    createRecoverSplit(name: string, description: string): RecoverSplit {
        const recoverSplit = RecoverSplit.create(name, description,
            this._vault, this._contactsManager.getContact) // auto saves in FSM
        this._recoverSplits[recoverSplit.pk] = recoverSplit;
        return recoverSplit
    }
    async saveRecoverSplit(recoverSplit: RecoverSplit): Promise<void> {
        await SS.save(recoverSplit.pk, recoverSplit.toDict())
        this._recoverSplits[recoverSplit.pk] = recoverSplit;
    }
    async loadRecoverSplits(): Promise<{[pk: string]: RecoverSplit}> {
        const recoverSplits: {string?: RecoverSplit} = {};
        const recoverSplitsData = await SS.getAll(
            StoredType.recoverSplit, this._vault.pk);
        for (let recoverSplitData of Object.values(recoverSplitsData)) {
            const c = RecoverSplit.fromDict(recoverSplitData, this._vault,
                this._contactsManager.getContact);
            recoverSplits[c.pk] = c;
        }
        this._recoverSplits = recoverSplits;
        return recoverSplits;
    }
    async deleteRecoverSplit(recoverSplit: RecoverSplit): Promise<void> {
        await SS.delete(recoverSplit.pk);
        delete this._recoverSplits[recoverSplit.pk];
    }
    getRecoverSplits(): {[pk: string]: RecoverSplit} {
        return this._recoverSplits;
    }
    getRecoverSplitsArray(): RecoverSplit[] {
        return Object.values(this._recoverSplits);
    }
    getRecoverSplit(pk: string): RecoverSplit {
        if(pk in this._recoverSplits)
            return this._recoverSplits[pk];
        throw new Error(`[RecoverSplitManager] not found: ${pk}`);
    }
    get length(): number {
        return Object.keys(this._recoverSplits).length;
    }
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

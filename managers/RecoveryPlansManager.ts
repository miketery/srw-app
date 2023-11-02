import base58 from 'bs58'

import { PublicKey, VerifyKey } from '../lib/nacl'
import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault'
import RecoveryPlan from '../models/RecoveryPlan'
import { RecoveryPlanResponse } from '../models/MessagePayload'
import { Message } from '../models/Message'
import ContactsManager from './ContactsManager'

class RecoveryPlansManager {
    private _vault: Vault;
    private _recoveryPlans: {string?: RecoveryPlan}
    private _contactsManager: ContactsManager;

    constructor(vault: Vault, recoveryPlans: {[pk: string]: RecoveryPlan} = {},
            contactsManager: ContactsManager) { 
        console.log('[RecoveryPlansManager.constructor] ' + vault.pk)
        this._vault = vault;
        this._recoveryPlans = recoveryPlans;
        this._contactsManager = contactsManager;
    }
    get contactsManager(): ContactsManager { return this._contactsManager; }
    clear() { this._recoveryPlans = {}; }
    createRecoveryPlan(name: string, description: string): RecoveryPlan {
        const recoveryPlan = RecoveryPlan.create(name, description,
            this._vault, this._contactsManager.getContact) // auto saves in FSM
        this._recoveryPlans[recoveryPlan.pk] = recoveryPlan;
        return recoveryPlan
    }
    async saveRecoveryPlan(recoveryPlan: RecoveryPlan): Promise<void> {
        await SS.save(recoveryPlan.pk, recoveryPlan.toDict())
        this._recoveryPlans[recoveryPlan.pk] = recoveryPlan;
    }
    async loadRecoveryPlans(): Promise<{[pk: string]: RecoveryPlan}> {
        const recoveryPlans: {string?: RecoveryPlan} = {};
        const recoveryPlansData = await SS.getAll(
            StoredType.recoveryPlan, this._vault.pk);
        for (let recoveryPlanData of Object.values(recoveryPlansData)) {
            const c = RecoveryPlan.fromDict(recoveryPlanData, this._vault,
                this._contactsManager.getContact);
            recoveryPlans[c.pk] = c;
        }
        this._recoveryPlans = recoveryPlans;
        return recoveryPlans;
    }
    async deleteRecoveryPlan(recoveryPlan: RecoveryPlan): Promise<void> {
        await SS.delete(recoveryPlan.pk);
        delete this._recoveryPlans[recoveryPlan.pk];
    }
    getRecoveryPlans(): {[pk: string]: RecoveryPlan} {
        return this._recoveryPlans;
    }
    getRecoveryPlansArray(): RecoveryPlan[] {
        return Object.values(this._recoveryPlans);
    }
    getRecoveryPlan(pk: string): RecoveryPlan {
        if(pk in this._recoveryPlans)
            return this._recoveryPlans[pk];
        throw new Error(`[RecoveryPlanManager] not found: ${pk}`);
    }
    async submitRecoveryPlan(recoveryPlan: RecoveryPlan, callback: () => void): Promise<void> {
        console.log('[RecoveryPlansManager.submitRecoveryPlan]', recoveryPlan.name)    
        recoveryPlan.fsm.send('SUBMIT', {callback})
    }
    // flows
    async processRecoveryPlanResponse(message: Message, callback?: () => void): Promise<void> {
        console.log('[RecoveryPlansManager.processRecoveryPlanResponse]', message)
        const contact = this._contactsManager.getContactByDid(message.sender.did)
        message.decrypt(contact.private_key)
        const payload = message.getData() as RecoveryPlanResponse
        console.log('PAYLOAD', payload)
        const recoveryPlan: RecoveryPlan = this.getRecoveryPlan(payload.recoveryPlanPk)
        if(payload.response === 'accept') {
            const party = recoveryPlan.recoveryPartys.filter(rp => rp.contactPk === contact.pk)[0]
            party.fsm.send('ACCEPT', {callback})
        } else if (payload.response === 'decline') {
            const party = recoveryPlan.recoveryPartys.filter(rp => rp.contactPk === contact.pk)[0]
            party.fsm.send('DECLINE', {callback})
        }
    }
}

export default RecoveryPlansManager;

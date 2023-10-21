import base58 from 'bs58'

import { PublicKey, VerifyKey } from '../lib/nacl'
import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault'
import RecoveryPlan from '../models/RecoveryPlan'
import Contact from '../models/Contact'

class RecoveryPlansManager {
    private _vault: Vault;
    private _recoveryPlans: {string?: RecoveryPlan}
    private _getContact: (pk: string) => Contact;

    constructor(vault: Vault, recoveryPlans: {[pk: string]: RecoveryPlan} = {},
            getContact: (pk: string) => Contact) { 
        console.log('[RecoveryPlansManager.constructor] ' + vault.pk)
        this._vault = vault;
        this._recoveryPlans = recoveryPlans;
        this._getContact = getContact;
    }
    clear() { this._recoveryPlans = {}; }
    createRecoveryPlan(name: string, description: string): RecoveryPlan {
        const recoveryPlan = RecoveryPlan.create(name, description,
            this._vault, this._getContact) // auto saves in FSM
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
                this._getContact);
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
}

export default RecoveryPlansManager;

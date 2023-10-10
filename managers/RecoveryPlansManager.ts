import base58 from 'bs58'

import { PublicKey, VerifyKey } from '../lib/nacl'
import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault'
import RecoveryPlan from '../models/RecoveryPlan'

class RecoveryPlansManager {
    private _recoveryPlans: {string?: RecoveryPlan}
    private _vault: Vault;

    constructor(vault: Vault, recoveryPlans: {[pk: string]: RecoveryPlan} = {}) { 
        console.log('[ContactsManager.constructor] ' + vault.pk)
        this._recoveryPlans = recoveryPlans;
        this._vault = vault;
    }
    clear() { this._recoveryPlans = {}; }
    async saveRecoveryPlan(recoveryPlan: RecoveryPlan): Promise<void> {
        await SS.save(recoveryPlan.pk, recoveryPlan.toDict())
        this._recoveryPlans[recoveryPlan.pk] = recoveryPlan;
    }
    async loadRecoveryPlans(): Promise<{[pk: string]: RecoveryPlan}> {
        const recoveryPlans: {string?: RecoveryPlan} = {};
        const recoveryPlansData = await SS.getAll(StoredType.recoveryPlan, this._vault.pk);
        for (let recoveryPlanData of Object.values(recoveryPlansData)) {
            const c = RecoveryPlan.fromDict(recoveryPlanData);
            recoveryPlans[c.pk] = c;
        }
        this._recoveryPlans = recoveryPlans;
        return recoveryPlans;
    }
    getContacts(): {[pk: string]: RecoveryPlan} {
        return this._recoveryPlans;
    }
    getContactsArray(): RecoveryPlan[] {
        return Object.values(this._recoveryPlans);
    }
    getContact(pk: string): RecoveryPlan {
        if(pk in this._recoveryPlans)
            return this._recoveryPlans[pk];
        throw new Error(`Contact not found: ${pk}`);
    }
}

export default RecoveryPlansManager;

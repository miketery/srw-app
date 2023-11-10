import base58 from 'bs58'

import { PublicKey, VerifyKey } from '../lib/nacl'
import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault'
import Guardian from '../models/Guardian'
import { Message } from '../models/Message'
import { MessageTypes } from './MessagesManager'
import ContactsManager from './ContactsManager'
import { RecoveryPlanInvite } from '../models/MessagePayload'
import DigitalAgentService, { SenderFunction } from '../services/DigitalAgentService'
import Contact from '../models/Contact'

class GuardiansManager {
    private _vault: Vault;
    private _guardians: {string?: Guardian}
    private _contactsManager: ContactsManager;
    private _sender: SenderFunction;

    constructor(vault: Vault, guardians: {[pk: string]: Guardian} = {},
            contactsManager: ContactsManager) { 
        console.log('[GuardiansManager.constructor] ' + vault.pk)
        this._vault = vault;
        this._guardians = guardians;
        this._contactsManager = contactsManager;
        this._sender = DigitalAgentService.getSendMessageFunction(this._vault)
    }
    clear() { this._guardians = {}; }
    createGuardian(name: string, description: string, recoveryPlanPk: string,
            shares: string[], contactPk: string): Guardian {
        const recoveryPlan = Guardian.create(name, description,
            this._vault.pk, recoveryPlanPk, shares, contactPk,
            this._contactsManager.getContact,
            this._sender) // auto saves in FSM
        this._guardians[recoveryPlan.pk] = recoveryPlan;
        return recoveryPlan
    }
    async saveGuardian(guardian: Guardian): Promise<void> {
        await guardian.save()
        this._guardians[guardian.pk] = guardian;
    }
    async loadGuardians(): Promise<{[pk: string]: Guardian}> {
        const guardians: {string?: Guardian} = {};
        const guardiansData = await SS.getAll(
            StoredType.guardian, this._vault.pk);
        for (let recoveryPlanData of Object.values(guardiansData)) {
            const c = Guardian.fromDict(recoveryPlanData,
                this._contactsManager.getContact, this._sender);
            guardians[c.pk] = c;
        }
        this._guardians = guardians;
        return guardians;
    }
    async deleteGuardian(recoveryPlan: Guardian): Promise<void> {
        await SS.delete(recoveryPlan.pk);
        delete this._guardians[recoveryPlan.pk];
    }
    getGuardians(): {[pk: string]: Guardian} {
        return this._guardians;
    }
    getGuardianArray(): Guardian[] {
        return Object.values(this._guardians);
    }
    getGuardian(pk: string): Guardian {
        if(pk in this._guardians)
            return this._guardians[pk];
        throw new Error(`[GuardiansManager] not found: ${pk}`);
    }
    async processGuardianRequest(message: Message, callback?: () => void)
            : Promise<{guardian: Guardian, contact: Contact}> {
        console.log('[GuardiansManager.processGuardianRequest]')
        if(message.type_name !== MessageTypes.recovery.invite) {
            throw new Error(`65 Invalid message type: ${message.type_name} should be ${MessageTypes.recovery.invite}`)
        }
        const contact = this._contactsManager.getContactByDid(message.sender.did)
        message.decrypt(contact.private_key)
        const data = message.getData() as RecoveryPlanInvite
        const guardian = this.createGuardian(
            data.name, data.description,
            data.recoveryPlanPk, data.shares, contact.pk)
        await this.saveGuardian(guardian)
        return {guardian,contact}
    }
    async acceptGuardian(pk: string, callback: () => void): Promise<void> {
        const guardian = this.getGuardian(pk)
        console.log('[GuardiansManager.acceptGuardian]', guardian.name)    
        guardian.fsm.send('ACCEPT', {callback})
    }
    async declineGuardian(pk: string, callback: () => void): Promise<void> {
        const guardian = this.getGuardian(pk)
        console.log('[GuardiansManager.declineGuardian]', guardian.name)    
        guardian.fsm.send('DECLINE', {callback})
    }
}

export default GuardiansManager;

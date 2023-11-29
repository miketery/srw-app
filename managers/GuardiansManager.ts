import base58 from 'bs58'

import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault'
import Guardian from '../models/Guardian'
import Contact from '../models/Contact'
import ContactsManager from './ContactsManager'
import { Message } from '../models/Message'
import { MessageTypes } from './MessagesManager'
import { RecoverSplitInvite, RecoverCombineRequest } from '../models/MessagePayload'
import { ManifestDict } from '../models/RecoverSplit'

class GuardiansManager {
    private _vault: Vault;
    private _guardians: {string?: Guardian}
    private _contactsManager: ContactsManager;

    constructor(vault: Vault, guardians: {[pk: string]: Guardian} = {},
            contactsManager: ContactsManager) { 
        console.log('[GuardiansManager.constructor] ' + vault.pk)
        this._vault = vault;
        this._guardians = guardians;
        this._contactsManager = contactsManager;
    }
    clear() { this._guardians = {}; }
    createGuardian(name: string, description: string, manifest: ManifestDict,
            shares: string[], contactPk: string): Guardian {
        const recoverSplit = Guardian.create(name, description,
            this._vault.pk, manifest, shares, contactPk,
            this._contactsManager.getContact,
            this._vault.sender) // auto saves in FSM
        this._guardians[recoverSplit.pk] = recoverSplit;
        return recoverSplit
    }
    async saveGuardian(guardian: Guardian): Promise<void> {
        await guardian.save()
        this._guardians[guardian.pk] = guardian;
    }
    async loadGuardians(): Promise<{[pk: string]: Guardian}> {
        const guardians: {string?: Guardian} = {};
        const guardiansData = await SS.getAll(
            StoredType.guardian, this._vault.pk);
        for (let recoverSplitData of Object.values(guardiansData)) {
            const c = Guardian.fromDict(recoverSplitData,
                this._contactsManager.getContact, this._vault.sender);
            guardians[c.pk] = c;
        }
        this._guardians = guardians;
        return guardians;
    }
    async deleteGuardian(recoverSplit: Guardian): Promise<void> {
        await SS.delete(recoverSplit.pk);
        delete this._guardians[recoverSplit.pk];
    }
    getGuardians(): {[pk: string]: Guardian} {
        return this._guardians;
    }
    getGuardiansArray(): Guardian[] {
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
        if(message.type_name !== MessageTypes.recoverSplit.invite) {
            throw new Error(`65 Invalid message type: ${message.type_name} should be ${MessageTypes.recoverSplit.invite}`)
        }
        const contact = this._contactsManager.getContactByDid(message.sender.did)
        message.decrypt(contact.private_key)
        const data = message.getData() as RecoverSplitInvite
        const guardian = this.createGuardian(
            data.name, data.description,
            data.manifest, data.shares, contact.pk)
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
    //
    async processRecoverCombineRequest(message: Message)
            : Promise<{guardian: Guardian, metadata: {verify_key: string, public_key: string}}> {
        console.log('[GuardiansManager.processRecoveryCombineRequest]')
        if(message.type_name !== MessageTypes.recoverCombine.request) {
            throw new Error(`96 Invalid message type: ${message.type_name} should be ${MessageTypes.recoverCombine.request}`)
        }
        message.decrypt(this._vault.private_key)
        const data = message.getData() as RecoverCombineRequest
        const guardian = this.getGuardiansArray().filter((g) => g.manifest.recoverSplitPk === data.recoverSplitPk)[0]
        const metadata = {verify_key: data.verify_key, public_key: data.public_key}
        return {guardian, metadata}
    }
    //
    async respondRecoverCombine(response: 'accept' | 'decline', metadata: {guardianPk: string, verify_key: string, public_key: string}, callback: () => void): Promise<void> {
        console.log('[GuardiansManager.acceptRecoverCombine]')
        const guardian = this.getGuardian(metadata.guardianPk)
        const msg = guardian.recoverCombineResponseMsg(response, {
            did: `did:arx:${metadata.verify_key}`,
            verify_key: base58.decode(metadata.verify_key),
            public_key: base58.decode(metadata.public_key)})
        await this._vault.sender(msg)
        callback()
    }
}

export default GuardiansManager;

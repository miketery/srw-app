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
import TypeManager from './TypeManager'

class GuardiansManager extends TypeManager<Guardian> {
    // private _vault: Vault;
    // private _guardians: {string?: Guardian}
    private _contactsManager: ContactsManager;

    constructor(vault: Vault, guardians: {[pk: string]: Guardian} = {},
            contactsManager: ContactsManager) { 
        console.log('[GuardiansManager.constructor] ' + vault.pk)
        super(vault, guardians, StoredType.guardian, Guardian)
        this._contactsManager = contactsManager;
    }
    saveGuardian = this.save
    createGuardian(name: string, description: string, manifest: ManifestDict,
            shares: string[], contactPk: string): Guardian {
        const guardian = Guardian.create(name, description,
            this.vault.pk, manifest, shares, contactPk,
            this._contactsManager.getContact,
            this.vault.sender) // auto saves in FSM
        this.saveGuardian(guardian)
        return guardian
    }
    loadGuardians = this.load
    deleteGuardian = this.delete
    getGuardian = this.get
    getGuardians = this.getAll
    getGuardiansArray = this.getAllArray
    ////
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
        message.decrypt(this.vault.private_key)
        const data = message.getData() as RecoverCombineRequest
        const guardian = this.getGuardiansArray().filter((g: Guardian) => g.manifest.recoverSplitPk === data.recoverSplitPk)[0]
        const metadata = {verify_key: data.verify_key, public_key: data.public_key}
        return {guardian, metadata}
    }
    //
    async respondRecoverCombine(response: 'accept' | 'decline', metadata: {guardianPk: string, verify_key: string, public_key: string}, callback: () => void): Promise<void> {
        console.log('[GuardiansManager.acceptRecoverCombine]')
        const guardian = this.getGuardian(metadata.guardianPk) as Guardian
        const msg = guardian.recoverCombineResponseMsg(response, {
            did: `did:arx:${metadata.verify_key}`,
            verify_key: base58.decode(metadata.verify_key),
            public_key: base58.decode(metadata.public_key)})
        await this.vault.sender(msg)
        callback()
    }
}

export default GuardiansManager;

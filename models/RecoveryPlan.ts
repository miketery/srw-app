import { base64toBytes, bytesToBase64, bytesToHex, getRandom, hexToBytes } from "../lib/utils";
import { v4 as uuidv4 } from 'uuid';
import secrets from 'secrets.js-grempe';
import { interpret } from 'xstate';

import SS, { StoredTypePrefix } from '../services/StorageService';
import RecoveryPlanMachine from '../machines/RecoveryPlanMachine';
import RecoveryPartyMachine from '../machines/RecoveryPartyMachine';
import Contact from "./Contact";
import DigitalAgentService, { SenderFunction } from "../services/DigitalAgentService";
import Vault from "./Vault";
import ContactsManager from "../managers/ContactsManager";
import { Message , OutboundMessageDict } from "./Message";
import { MessageTypes } from "../managers/MessagesManager";
import { RecoveryPlanInvite } from "./MessagePayload";

export enum RecoveryPartyState {
    INIT = 'INIT',
    INVITED = 'INVITED',
    CAN_RESEND_INVITE = 'CAN_RESEND_INVITE',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    FINALIZED = 'FINALIZED',
}
interface RecoveryPartyDict {
    pk: string,
    contactPk: string,
    name: string,
    numShares: number,
    shares: string[], //TODO: add salt & hash
    receiveManifest: boolean,
    state: RecoveryPartyState 
}
export class RecoveryParty {
    pk: string
    contactPk: string
    name: string
    description: string
    numShares: number
    shares: string[] // hex
    receiveManifest: boolean
    _state: RecoveryPartyState
    fsm: any
    recoveryPlan: RecoveryPlan

    constructor(pk: string, contactPk: string, name: string,
            numShares: number, shares: string[], 
            receiveManifest: boolean,  state: RecoveryPartyState,
            recoveryPlan: RecoveryPlan) {
        this.pk = pk
        this.contactPk = contactPk
        this.name = name
        this.numShares = numShares
        this.shares = shares
        this.receiveManifest = receiveManifest
        this._state = state
        this.recoveryPlan = recoveryPlan
        console.log('[RecoveryParty.constructor]', this.toString(), this.recoveryPlan.name)
    }
    get state(): RecoveryPartyState {
        if(this.fsm)
            return this.fsm.getSnapshot().value
        return this._state
    }
    static fromDict(data: RecoveryPartyDict, recoveryPlan: RecoveryPlan): RecoveryParty {
        return new RecoveryParty(data.pk, data.contactPk, data.name,
            data.numShares, data.shares, data.receiveManifest, data.state, recoveryPlan)
    }
    toDict(): RecoveryPartyDict {
        return {
            pk: this.pk,
            contactPk: this.contactPk,
            name: this.name,
            numShares: this.numShares,
            shares: this.shares,
            receiveManifest: this.receiveManifest,
            state: this.state,
        }
    }
    toString(): string {
        return 'RecoveryParty<'+[this.pk, this.contactPk, this.name, this.state].join(', ')+'>'
    }
    startAndGetFsm(sender: SenderFunction): any {
        console.log('[RecoveryParty.startAndGetFsm]', this.toString())
        if(this.fsm) {
            console.log('[RecoveryParty.startAndGetFsm] fsm already exists')
            return this.fsm
        }
        this.fsm = interpret(RecoveryPartyMachine.withContext({
            recoveryParty: this,
            sender: sender,
        }))
        this.fsm.onTransition((context: {recoveryPlan: RecoveryPlan}, event) => {
            if(context.recoveryPlan)
                console.log('[RecoveryParty.fsm.onTransition]', context.recoveryPlan.toString(), event)
            else
                console.log('[RecoveryParty.fsm.onTransition]', event)
        })
        this.fsm.start(this._state)
        return this.fsm
    }
    assignShare(share: string): void {
        console.log('[RecoveryParty.assignShare]', this.name)
        this.shares.push(share)
    }
    inviteMessage(): OutboundMessageDict {
        const contact = this.recoveryPlan.getContact(this.contactPk)
        const payload: RecoveryPlanInvite = {
            recoveryPlanPk: this.recoveryPlan.pk,
            name: this.recoveryPlan.name,
            description: this.recoveryPlan.description,
            shares: this.shares,
        }
        const message = Message.forContact(contact, payload,
            MessageTypes.recovery.invite, '0.1')
        message.encryptBox(contact.private_key)
        return message.outboundFinal()
    }
}
export enum RecoveryPlanState {
    DRAFT = 'DRAFT',
    SPLITTING_KEY = 'SPLITTING_KEY',
    READY_TO_SEND_INVITES = 'READY_TO_SEND_INVITES',
    SENDING_INVITES = 'SENDING_INVITES',
    WAITING_ON_PARTICIPANTS = 'WAITING_ON_PARTICIPANTS',
    READY = 'READY',
    FINAL = 'FINAL',
    ARCHIVED = 'ARCHIVED'
}
export enum PayloadType {
    OBJECT = 'OBJECT',
    STRING = 'STRING',
}
interface RecoveryPlanDict {
    pk: string,
    vaultPk: string,

    name: string,
    description: string,

    payload: string, // base 64?
    payloadType: PayloadType,

    key: string, //hex
    
    recoveryPartys: RecoveryPartyDict[],
    threshold: number,
    // no need for totalShares since derived from recoveryParty.numShares

    state: RecoveryPlanState,
    created: number, // unix timestamp
}

class RecoveryPlan {
    pk: string;
    vaultPk: string;
    
    name: string;
    description: string;
    
    payload: Uint8Array;
    payloadType: PayloadType;
    
    key: Uint8Array;
    recoveryPartys: RecoveryParty[];
    threshold: number;
    
    _state: RecoveryPlanState;
    created: number;
    
    vault: Vault;
    fsm: any;
    getContact: (pk: string) => Contact;

    constructor(pk: string, vaultPk: string,
            name: string, description: string,
            payload: Uint8Array, payloadType: PayloadType,
            key: Uint8Array,
            recoveryPartys: RecoveryPartyDict[], threshold: number,
            state: RecoveryPlanState, created: number,
            vault: Vault, getContact: (pk: string) => Contact) {
        console.log('[RecoveryPlan.constructor]')
        this.pk = pk
        this.vaultPk = vaultPk
        
        this.name = name;
        this.description = description;

        this.payload = payload
        this.payloadType = payloadType
        
        this.key = key

        this.recoveryPartys = recoveryPartys.map(
            p => RecoveryParty.fromDict(p, this))
        this.threshold = threshold
        
        this._state = state;
        this.getContact = getContact
        this.created = created;
        this.vault = vault
        this.fsm = interpret(RecoveryPlanMachine.withContext({
                recoveryPlan: this,
                partyMachines: {},
                sender: DigitalAgentService.getPostMessageFunction(this.vault),
        }))
        this.fsm.onTransition((context: {recoveryPlan: RecoveryPlan}, event) => {
            if(context.recoveryPlan)
                console.log('[RecoveryPlan.fsm.onTransition]', context.recoveryPlan.toString(), event)
            else
                console.log('[RecoveryPlan.fsm.onTransition]', event)
        })
        this.fsm.start(this._state)
    }
    // getContact(pk: string): Contact {
    //     console.log('[RecoveryPlan.getContact]', pk)
    //     return this._contactsManager.getContact(pk)
    // }
    get state(): RecoveryPlanState {
        return this.fsm.getSnapshot().value
    }
    save(): void {
        console.log('[RecoveryPlan.save]', this.toString())        
        SS.save(this.pk, this.toDict())
    }
    static create(name: string, description: string,
            vault: Vault, getContact: (pk: string) => Contact) {
        const pk = StoredTypePrefix.recoveryPlan + uuidv4()
        return new RecoveryPlan(
            pk, vault.pk, name, description,
            Uint8Array.from([]), PayloadType.OBJECT,
            Uint8Array.from([]),
            [], 0,
            RecoveryPlanState.DRAFT, Math.floor(Date.now() / 1000),
            vault, getContact)
    }
    static fromDict(data: RecoveryPlanDict,
            vault: Vault, getContact: (pk: string) => Contact): RecoveryPlan {
        const key = hexToBytes(data.key)
        const payload = base64toBytes(data.payload)
        return new RecoveryPlan(data.pk, data.vaultPk,
            data.name, data.description, 
            payload, data.payloadType,
            key, data.recoveryPartys, data.threshold,
            data.state, data.created, vault, getContact)
    }
    toDict(): RecoveryPlanDict {
        return {
            pk: this.pk,
            vaultPk: this.vaultPk,
            
            name: this.name,
            description: this.description,

            payload: bytesToBase64(this.payload),
            payloadType: this.payloadType,

            key: bytesToHex(this.key),

            recoveryPartys: this.recoveryPartys.map(
                recoveryParty => recoveryParty.toDict()),
            threshold: this.threshold,

            state: this.state,
            created: this.created,
        }
    }
    toString(): string {
        return 'RecoveryPlan<' + [this.pk, this.name, this.state].join(', ') + '>'
    }
    get totalShares(): number {
        return this.recoveryPartys.map(p => p.numShares).reduce((a, b) => a + b)
    }
    addRecoveryParty(contact: Contact, numShares: number, receiveManifest: boolean) {
        const recoveryParty = new RecoveryParty(
            uuidv4(), contact.pk, contact.name, numShares,
            [], receiveManifest, RecoveryPartyState.INIT, this)
        this.recoveryPartys.push(recoveryParty)
    }
    setPayload(payload: Uint8Array, payloadType: PayloadType): void {
        this.payload = payload
        this.payloadType = payloadType
    }
    async generateKey(): Promise<void> {
        this.key = await getRandom(32)
    }
    setThreshold(threshold: number): void {
        this.threshold = threshold
    }
    checkValidPreSubmit(): {valid: boolean, error?: string} {
        if(this.threshold < 2)
            return {
                valid: false, 
                error: 'Threshold needs to be atleast 2'
            }
        const maxShares = this.totalShares
        if(this.threshold > maxShares)
            return {
                valid: false,
                error: 'Threshold can not exceed total possible shares ('+maxShares+')'
            }
        return {
            valid: true,
        }
    }
    async splitKey(): Promise<boolean> {
        console.log('[RecoveryPlan.splitKey]', this.totalShares, this.threshold)
        const keyHex = bytesToHex(this.key)
        const shares = secrets.share(keyHex, this.totalShares, this.threshold)
        shares.forEach(s => console.log(s))
        for(let i = 0; i < this.recoveryPartys.length; i++) {
            for(let j = 0; j < this.recoveryPartys[i].numShares; j++)
                this.recoveryPartys[i].assignShare(shares.shift())
        }
        return Promise.resolve(true)
    }

}

export default RecoveryPlan;
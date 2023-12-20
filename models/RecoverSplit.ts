import { base64toBytes, bytesToBase64, bytesToHex, getRandom, hexToBytes, secret_box } from "../lib/utils";
import { v4 as uuidv4 } from 'uuid';
import secrets from '../lib/secretsGrempe';
import { interpret } from 'xstate';

import SS, { StoredTypePrefix } from '../services/StorageService';
import RecoverSplitMachine from '../machines/RecoverSplitMachine';
import RecoverSplitPartyMachine from '../machines/RecoverSplitPartyMachine';
import Contact from "./Contact";
import { SenderFunction } from "../services/DigitalAgentService";
import Vault from "./Vault";
import { Message , OutboundMessageDict } from "./Message";
import { MessageTypes } from "../managers/MessagesManager";
import { RecoverSplitInvite } from "./MessagePayload";
import nacl from "tweetnacl-sealed-box";

export enum RecoverSplitState {
    START = 'START',
    SPLITTING_KEY = 'SPLITTING_KEY',
    READY_TO_SEND_INVITES = 'READY_TO_SEND_INVITES',
    SENDING_INVITES = 'SENDING_INVITES',
    WAITING_ON_PARTICIPANTS = 'WAITING_ON_PARTICIPANTS',
    READY = 'READY',
    FINAL = 'FINAL',
    ARCHIVED = 'ARCHIVED'
}

export enum RecoverSplitPartyState {
    START = 'START',
    SENDING_INVITE = 'SENDING_INVITE',
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    FINAL = 'FINAL',
}

export type ManifestDict = {
    recoverSplitPk: string,
    name: string,
    payloadHash: string,
    encryptedPayload: string, // base64
    threshold: number,
    recoverSplitPartys: {
        name: string,
        did: string,
        verify_key: string,
        public_key: string,
    }[]
}
interface RecoverSplitDict {
    pk: string,
    vaultPk: string,

    name: string,
    description: string,

    payload: string, // base 64
    encryptedPayload: string, // base 64

    key: string, //hex
    
    recoverSplitPartys: RecoverSplitPartyDict[],
    threshold: number,
    // no need for totalShares since derived from recoverSplitParty.numShares

    state: RecoverSplitState,
    created: number, // unix timestamp
}

type RecoverSplitPartyDict = {
    pk: string,
    contactPk: string,
    name: string,
    numShares: number,
    shares: string[], //TODO: add salt & hash
    receiveManifest: boolean,
    state: RecoverSplitPartyState 
}
export class RecoverSplitParty {
    pk: string
    contactPk: string
    name: string
    description: string
    numShares: number
    shares: string[] // hex
    receiveManifest: boolean
    _state: RecoverSplitPartyState
    fsm: any
    recoverSplit: RecoverSplit

    constructor(pk: string, contactPk: string, name: string,
            numShares: number, shares: string[], 
            receiveManifest: boolean,  state: RecoverSplitPartyState,
            recoverSplit: RecoverSplit) {
        this.pk = pk
        this.contactPk = contactPk
        this.name = name
        this.numShares = numShares
        this.shares = shares
        this.receiveManifest = receiveManifest
        this._state = state
        this.recoverSplit = recoverSplit
        console.log('[RecoverSplitParty.constructor]', this.toString(), this.recoverSplit.name)
        //
        if(!['ACCEPTED', 'FINAL'].includes(this.state))
            this.initFSM()
    }
    get state(): RecoverSplitPartyState {
        if(this.fsm)
            return this.fsm.getSnapshot().value
        return this._state
    }
    static fromDict(data: RecoverSplitPartyDict, recoverSplit: RecoverSplit): RecoverSplitParty {
        return new RecoverSplitParty(data.pk, data.contactPk, data.name,
            data.numShares, data.shares, data.receiveManifest, data.state,
            recoverSplit)
    }
    toDict(): RecoverSplitPartyDict {
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
        return 'RecoverSplitParty<'+[this.pk, this.contactPk, this.name, this.state].join(', ')+'>'
    }
    initFSM(): any {
        console.log('[RecoverSplitParty.initFSM]', this.toString())
        if(this.fsm) {
            console.log('[RecoverSplitParty.initFSM] fsm already exists')
            return this.fsm
        }
        this.fsm = interpret(RecoverSplitPartyMachine.withContext({
            recoverSplitParty: this,
            sender: this.recoverSplit.sender,
        }))
        this.fsm.onTransition((state: {context: {recoverSplitParty: RecoverSplitParty}}) => {
            console.log('[RecoverSplitParty.fsm.onTransition]', state.context.recoverSplitParty.toString())
        })
        this.fsm.start(this._state)
        this.fsm.send('REDO')
        // ^^^^ v4 workaround to get invoke to work
        // if in SENDING_INVITE state
        return this.fsm
    }
    assignShare(share: string): void {
        console.log('[RecoverSplitParty.assignShare]', this.name)
        this.shares.push(share)
    }
    inviteMessage(): OutboundMessageDict {
        const contact = this.recoverSplit.getContact(this.contactPk)
        const payload: RecoverSplitInvite = {
            name: this.recoverSplit.name,
            description: this.recoverSplit.description,
            shares: this.shares,
            manifest: this.recoverSplit.getManifest(),
        }
        const message = Message.forContact(contact, payload,
            MessageTypes.recoverSplit.invite, '0.1')
        message.encryptBox(contact.private_key)
        return message.outboundFinal()
    }
}

class RecoverSplit {
    pk: string;
    vaultPk: string;
    
    name: string;
    description: string;
    
    payload: Uint8Array;
    encryptedPayload: Uint8Array;
    
    key: Uint8Array;
    recoverSplitPartys: RecoverSplitParty[];
    threshold: number;
    
    _state: RecoverSplitState;
    created: number;
    
    vault: Vault;
    fsm: any;
    getContact: (pk: string) => Contact;

    _cachedManifest: ManifestDict | null = null

    constructor(pk: string, vaultPk: string,
            name: string, description: string,
            payload: Uint8Array, encryptedPayload: Uint8Array,
            key: Uint8Array,
            recoverSplitPartys: RecoverSplitPartyDict[], threshold: number,
            state: RecoverSplitState, created: number,
            vault: Vault, getContact: (pk: string) => Contact) {
        console.log('[RecoverSplit.constructor]')
        this.pk = pk
        this.vaultPk = vaultPk
        
        this.name = name;
        this.description = description;

        this.payload = payload
        this.encryptedPayload = this.encryptedPayload

        this.key = key
        this.threshold = threshold
        
        this._state = state;
        this.getContact = getContact
        this.created = created;
        this.vault = vault

        this.recoverSplitPartys = recoverSplitPartys.map(
            p => RecoverSplitParty.fromDict(p, this))
        
        if(!['FINAL', 'ARCHIVED'].includes(this._state))
            this.initFSM()
    }
    initFSM() {
        const machine = RecoverSplitMachine.withContext({recoverSplit: this})
        this.fsm = interpret(machine)
        this.fsm.onTransition((state: {context: {recoverSplit: RecoverSplit}}) => {
            console.log('[RecoverSplit.fsm.onTransition]',
                state.context.recoverSplit.toString())
        })
        this.fsm.start(this._state)
        this.fsm.send('') // force check of guards
    }
    // getContact(pk: string): Contact {
    //     console.log('[RecoverSplit.getContact]', pk)
    //     return this._contactsManager.getContact(pk)
    // }
    get state(): RecoverSplitState {
        return this.fsm.getSnapshot().value
    }
    get sender(): SenderFunction {
        return this.vault.sender
    }
    save(): void {
        console.log('[RecoverSplit.save]', this.toString())        
        SS.save(this.pk, this.toDict())
    }
    static create(name: string, description: string,
            vault: Vault, getContact: (pk: string) => Contact) {
        const pk = StoredTypePrefix.recoverSplit + uuidv4()
        return new RecoverSplit(
            pk, vault.pk, name, description,
            Uint8Array.from([]),
            Uint8Array.from([]),
            Uint8Array.from([]),
            [], 0,
            RecoverSplitState.START, Math.floor(Date.now() / 1000),
            vault, getContact)
    }
    static fromDict(data: RecoverSplitDict,
            vault: Vault, getContact: (pk: string) => Contact): RecoverSplit {
        const key = hexToBytes(data.key)
        const payload = base64toBytes(data.payload)
        const encryptedPayload = base64toBytes(data.encryptedPayload)
        return new RecoverSplit(data.pk, data.vaultPk,
            data.name, data.description, 
            payload, encryptedPayload,
            key, data.recoverSplitPartys, data.threshold,
            data.state, data.created, vault, getContact)
    }
    toDict(): RecoverSplitDict {
        return {
            pk: this.pk,
            vaultPk: this.vaultPk,
            
            name: this.name,
            description: this.description,

            payload: bytesToBase64(this.payload),
            encryptedPayload: bytesToBase64(this.encryptedPayload),

            key: bytesToHex(this.key),

            recoverSplitPartys: this.recoverSplitPartys.map(
                recoverSplitParty => recoverSplitParty.toDict()),
            threshold: this.threshold,

            state: this.state,
            created: this.created,
        }
    }
    toString(): string {
        return 'RecoverSplit<' + [this.pk, this.name, this.state].join(', ') + '>'
    }
    get totalShares(): number {
        return this.recoverSplitPartys.map(p => p.numShares).reduce((a, b) => a + b)
    }
    get totalParties(): number {
        return this.recoverSplitPartys.length
    }
    addRecoverSplitParty(contact: Contact, numShares: number, receiveManifest: boolean) {
        const recoverSplitParty = new RecoverSplitParty(
            uuidv4(), contact.pk, contact.name, numShares,
            [], receiveManifest, RecoverSplitPartyState.START, this)
        this.recoverSplitPartys.push(recoverSplitParty)
    }
    async generateKey(): Promise<void> {
        this.key = await getRandom(32)
    }
    setPayload(payload: Uint8Array): void {
        this.payload = payload
    }
    encryptPayload(): void {
        this.encryptedPayload = secret_box(this.payload, this.key)
    }
    clearPayloadAndKey(): void {
        this.payload = Uint8Array.from([])
        this.key = Uint8Array.from([])
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
        // TODO: check payload and ecnrytped is set
        return {
            valid: true,
        }
    }
    async splitKey(): Promise<boolean> {
        console.log('[RecoverSplit.splitKey]', this.totalShares, this.threshold)
        const keyHex = bytesToHex(this.key)
        const shares = secrets.share(keyHex, this.totalShares, this.threshold)
        shares.forEach(s => console.log(s))
        for(let i = 0; i < this.recoverSplitPartys.length; i++) {
            for(let j = 0; j < this.recoverSplitPartys[i].numShares; j++)
                this.recoverSplitPartys[i].assignShare(shares.shift())
        }
        return Promise.resolve(true)
    }
    getManifest(): ManifestDict {
        if(this._cachedManifest)
            return this._cachedManifest
        this._cachedManifest = {
            recoverSplitPk: this.pk,
            name: this.name,
            encryptedPayload: bytesToBase64(this.encryptedPayload),
            payloadHash: bytesToHex(nacl.hash(this.payload)),
            threshold: this.threshold,
            recoverSplitPartys: this.recoverSplitPartys.map(p => {
                const contact = this.getContact(p.contactPk)
                return {
                    did: contact.did,
                    verify_key: contact.b58_their_verify_key,
                    public_key: contact.b58_their_public_key,
                    name: p.name,
                }
            })
        }
        return this._cachedManifest
    }
    allPartysAccepted(): boolean {
        return this.recoverSplitPartys.every(p => p.state === RecoverSplitPartyState.ACCEPTED)
    }
    allInvitesSent(): boolean {
        return this.recoverSplitPartys.every(p => p.state !== RecoverSplitPartyState.START)
    }
}

export default RecoverSplit;
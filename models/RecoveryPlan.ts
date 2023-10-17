import { base64toBytes, bytesToBase64, bytesToHex, getRandom, hexToBytes } from "../lib/utils";
import { v4 as uuidv4 } from 'uuid';
import secrets from 'secrets.js-grempe';
import { interpret } from 'xstate';

import SS, { StoredTypePrefix } from '../services/StorageService';
import RecoveryPlanMachine from '../machines/RecoveryPlanMachine';
import Contact from "./Contact";
import DigitalAgentService from "../services/DigitalAgentService";
import Vault from "./Vault";


export enum PartyState {
    INIT = 'INIT',
    INVITED = 'INVITED',
    CAN_RESEND_INVITE = 'CAN_RESEND_INVITE',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    FINALIZED = 'FINALIZED',
}
interface PartyDict {
    pk: string,
    contactPk: string,
    name: string,
    numShares: number,
    shares: string[], //TODO: add salt & hash
    receiveManifest: boolean,
    state: PartyState
}
class Party {
    pk: string
    contactPk: string
    name: string
    numShares: number
    shares: string[] // hex
    receiveManifest: boolean
    state: PartyState
    // fsm: any

    constructor(pk: string, contactPk: string, name: string,
            numShares: number, shares: string[], 
            receiveManifest: boolean,  state: PartyState) {
        this.pk = pk
        this.contactPk = contactPk
        this.name = name
        this.numShares = numShares
        this.shares = shares
        this.receiveManifest = receiveManifest
        this.state = state
        //FSM
    }
    static fromDict(data: PartyDict): Party {
        return new Party(data.pk, data.contactPk, data.name,
            data.numShares, data.shares, data.receiveManifest, data.state)
    }
    toDict(): PartyDict {
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
        return 'Party<'+[this.pk, this.contactPk, this.name, this.state].join(', ')+'>'
    }
    assignShare(share: string): void {
        console.log(this.pk, share)
        this.shares.push(share)
    }
}
export enum RecoveryPlanState {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FINAL = 'FINAL', // all received 
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
    
    partys: PartyDict[],
    threshold: number,
    // no need for totalShares since derived from party.numShares

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
    partys: Party[];
    threshold: number;
    
    _state: RecoveryPlanState;
    created: number;
    vault: Vault;
    fsm: any;

    constructor(pk: string, vaultPk: string,
            name: string, description: string,
            payload: Uint8Array, payloadType: PayloadType,
            key: Uint8Array,
            partys: Party[], threshold: number,
            state: RecoveryPlanState, created: number, vault: Vault) {
        console.log('[RecoveryPlan.constructor]')
        this.pk = pk
        this.vaultPk = vaultPk
        
        this.name = name;
        this.description = description;

        this.payload = payload
        this.payloadType = payloadType
        
        this.key = key

        this.partys = partys
        this.threshold = threshold
        
        this._state = state;
        this.created = created;
        this.vault = vault
        const resolvedState = RecoveryPlanMachine.resolveState({
            ...RecoveryPlanMachine.initialState,
            value: this._state,
            context: {
                recoveryPlan: this,
                sender: DigitalAgentService.getPostMessageFunction(this.vault),
            }
        })
        this.fsm = interpret(RecoveryPlanMachine) 
        // could do RecoveryPlanMachine.withContext({...}})
        // and then fsm.start(this._state)
        this.fsm.onTransition((context: {recoveryPlan: RecoveryPlan}, event) => {
            if(context.recoveryPlan)
                console.log('[RecoveryPlan.fsm.onTransition]', context.recoveryPlan.toString(), event)
            else
                console.log('[RecoveryPlan.fsm.onTransition]', event)
        })
        this.fsm.start(resolvedState)
    }
    get state(): RecoveryPlanState {
        return this.fsm.getSnapshot().value
    }
    static create(vaultPk: string, name: string, description: string, vault: Vault) {
        const pk = StoredTypePrefix.recoveryPlan + uuidv4()
        return new RecoveryPlan(
            pk, vaultPk, name, description,
            Uint8Array.from([]), PayloadType.OBJECT,
            Uint8Array.from([]),
            [], 0,
            RecoveryPlanState.DRAFT, Math.floor(Date.now() / 1000), vault)
    }
    static fromDict(data: RecoveryPlanDict, vault: Vault): RecoveryPlan {
        const key = hexToBytes(data.key)
        const payload = base64toBytes(data.payload)
        const partys = data.partys.map(
            partipantData => Party.fromDict(partipantData))
        return new RecoveryPlan(data.pk, data.vaultPk,
            data.name, data.description, 
            payload, data.payloadType,
            key, partys, data.threshold,
            data.state, data.created, vault)
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

            partys: this.partys.map(
                party => party.toDict()),
            threshold: this.threshold,

            state: this.state,
            created: this.created,
        }
    }
    toString(): string {
        return 'RecoveryPlan<' + [this.pk, this.name, this.state].join(', ') + '>'
    }
    get totalShares(): number {
        return this.partys.map(p => p.numShares).reduce((a, b) => a + b)
    }
    addParty(contact: Contact, numShares: number, receiveManifest: boolean) {
        const party = new Party(
            uuidv4(), contact.pk, contact.name, numShares,
            [], receiveManifest, PartyState.INIT)
        this.partys.push(party)
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
        for(let i = 0; i < this.partys.length; i++) {
            for(let j = 0; j < this.partys[i].numShares; j++)
                this.partys[i].assignShare(shares.shift())
        }
        return Promise.resolve(true)
    }

}

export default RecoveryPlan;
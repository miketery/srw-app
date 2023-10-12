import { base64toBytes, bytesToBase64, bytesToHex, getRandom, hexToBytes, shamirSplit } from "../lib/utils";
import { v4 as uuidv4 } from 'uuid';

import ContactMachine from '../machines/ContactMachine';
import { interpret } from 'xstate';

import SS, { StoredTypePrefix } from '../services/StorageService';
import Contact from "./Contact";


export enum ParticipantState {
    INIT = 'INIT',
    INVITED = 'INVITED',
    CAN_RESEND_INVITE = 'CAN_RESEND_INVITE',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    FINALIZED = 'FINALIZED',
}
interface ParticipantDict {
    pk: string,
    contactPk: string,
    name: string,
    numShares: number,
    shares: string[], //TODO: add salt & hash
    receiveManifest: boolean,
    state: ParticipantState
}
class Participant {
    pk: string
    contactPk: string
    name: string
    numShares: number
    shares: Uint8Array[]
    receiveManifest: boolean
    state: ParticipantState
    // fsm: any

    constructor(pk: string, contactPk: string, name: string,
            numShares: number, shares: Uint8Array[], 
            receiveManifest: boolean,  state: ParticipantState) {
        this.pk = pk
        this.contactPk = contactPk
        this.name = name
        this.numShares = numShares
        this.shares = shares
        this.receiveManifest = receiveManifest
        this.state = state
        //FSM
    }
    static fromDict(data: ParticipantDict): Participant {
        const shares = data.shares.map(s => hexToBytes(s))
        return new Participant(data.pk, data.contactPk, data.name,
            data.numShares, shares, data.receiveManifest, data.state)
    }
    toDict(): ParticipantDict {
        return {
            pk: this.pk,
            contactPk: this.contactPk,
            name: this.name,
            numShares: this.numShares,
            shares: this.shares.map(s => bytesToHex(s)),
            receiveManifest: this.receiveManifest,
            state: this.state,
        }
    }
    toString(): string {
        return 'Participant<'+[this.pk, this.contactPk, this.name, this.state].join(', ')+'>'
    }
    assignShare(share: Uint8Array): void {
        console.log(this.pk, bytesToHex(share))
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
    
    participants: ParticipantDict[],
    threshold: number,
    // no need for totalShares since derived from participant.numShares

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
    participants: Participant[];
    threshold: number;
    
    state: RecoveryPlanState;
    created: number;
    fsm: any;

    constructor(pk: string, vaultPk: string,
            name: string, description: string,
            payload: Uint8Array, payloadType: PayloadType,
            key: Uint8Array,
            participants: Participant[], threshold: number,
            state: RecoveryPlanState, created: number) {
        console.log('[RecoveryPlan.constructor]')
        this.pk = pk
        this.vaultPk = vaultPk
        
        this.name = name;
        this.description = description;

        this.payload = payload
        this.payloadType = payloadType
        
        this.key = key

        this.participants = participants
        this.threshold = threshold
        
        this.state = state;
        this.created = created;
        // this.fsm // interpret(Machine)
    }
    static create(vaultPk: string, name: string, description: string) {
        const pk = StoredTypePrefix.recoveryPlan + uuidv4()
        return new RecoveryPlan(
            pk, vaultPk, name, description,
            Uint8Array.from([]), PayloadType.OBJECT,
            Uint8Array.from([]),
            [], 0,
            RecoveryPlanState.DRAFT, Math.floor(Date.now() / 1000))
    }
    static fromDict(data: RecoveryPlanDict): RecoveryPlan {
        const key = hexToBytes(data.key)
        const payload = base64toBytes(data.payload)
        const participants = data.participants.map(
            partipantData => Participant.fromDict(partipantData))
        return new RecoveryPlan(data.pk, data.vaultPk,
            data.name, data.description, 
            payload, data.payloadType,
            key, participants, data.threshold,
            data.state, data.created)
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

            participants: this.participants.map(
                participant => participant.toDict()),
            threshold: this.threshold,

            state: this.state,
            created: this.created,
        }
    }
    toString(): string {
        return 'RecoveryPlan<' + [this.pk, this.name, this.state].join(', ') + '>'
    }
    get totalShares(): number {
        return this.participants.map(p => p.numShares).reduce((a, b) => a + b)
    }
    addParticipant(contact: Contact, numShares: number, receiveManifest: boolean) {
        const participant = new Participant(
            uuidv4(), contact.pk, contact.name, numShares,
            [], receiveManifest, ParticipantState.INIT)
        this.participants.push(participant)
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
        console.log(bytesToHex(this.key))
        let shares = await shamirSplit(this.key, this.totalShares, this.threshold)
        shares.forEach(s => console.log(bytesToBase64(s)))
        for(let i = 0; i < this.participants.length; i++) {
            for(let j = 0; j < this.participants[i].numShares; j++)
                this.participants[i].assignShare(shares.shift())
        }
        return Promise.resolve(true)
    }

}

export default RecoveryPlan;
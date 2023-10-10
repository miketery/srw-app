import { bytesToHex, hexToBytes } from "../lib/utils";

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
    share: string,

    state: ParticipantState
}
class Participant {
    pk: string
    contactPk: string
    share: string
    state: ParticipantState

    constructor(pk: string, contactPk: string,
            share: string, state: ParticipantState) {
        this.pk = pk
        this.contactPk = contactPk
        this.share = share
        this.state = state
        //FSM
    }
    static fromDict(data: ParticipantDict): Participant {
        return new Participant(data.pk, data.contactPk,
            data.share, data.state)
    }
    toDict(): ParticipantDict {
        return {
            pk: this.pk,
            contactPk: this.contactPk,
            share: this.share,
            state: this.state,
        }
    }
    toString(): string {
        return 'Participant<'+[this.pk, this.contactPk, this.state].join(', ')+'>'
    }
}
export enum RecoveryPlanState {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FINAL = 'FINAL', // all received 
}
enum SecretType {
    STRING = 'STRING',
    BYTES = 'BYTES',
}
interface RecoveryPlanDict {
    pk: string,
    vault_pk: string,

    secretType: SecretType, 
    secret: string, //hex
    salt: string, // hex
    hash: string, //hex

    participants: ParticipantDict[],

    name: string,
    description: string,
    state: RecoveryPlanState,

    created: number, // unit timestamp
}

class RecoveryPlan {
    pk: string;
    vault_pk: string;
    
    secretType: SecretType;
    secret: Uint8Array;
    salt: Uint8Array;
    hash: Uint8Array;

    participants: Participant[];

    name: string;
    description: string;
    
    state: RecoveryPlanState;
    created: number;
    fsm: any;

    constructor(pk: string, vault_pk: string,
            secretType: SecretType, secret: Uint8Array,
            salt: Uint8Array, hash: Uint8Array,
            participants: Participant[],
            name: string, description: string,
            state: RecoveryPlanState, created: number) {
        this.pk = pk
        this.vault_pk = vault_pk

        this.secretType = secretType
        this.secret = secret
        this.salt = salt
        this.hash = hash
        this.participants = participants

        this.name = name;
        this.description = description;
        
        this.state = state;
        this.created = created;
        // this.fsm // interpret(Machine)
    }
    static fromDict(data: RecoveryPlanDict): RecoveryPlan {
        const hash = hexToBytes(data.hash)
        const secret = hexToBytes(data.secret)
        const salt = hexToBytes(data.salt)
        const participants = data.participants.map(
            partipantData => Participant.fromDict(partipantData))
        return new RecoveryPlan(data.pk, data.vault_pk,
            data.secretType, secret, salt, hash,
            participants, data.name, data.description, 
            data.state, data.created)
    }
    toDict(): RecoveryPlanDict {
        return {
            pk: this.pk,
            vault_pk: this.vault_pk,

            secretType: this.secretType,
            secret: bytesToHex(this.secret),
            salt: bytesToHex(this.salt),
            hash: bytesToHex(this.hash),
            participants: this.participants.map(
                participant => participant.toDict()),

            name: this.name,
            description: this.description,

            state: this.state,
            created: this.created,
        }
    }
    toString(): string {
        return 'RecoveryPlan<' + [this.pk, this.name, this.state].join(', ') + '>'
    }

}

export default RecoveryPlan;
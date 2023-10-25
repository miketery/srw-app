import { base64toBytes, bytesToBase64, bytesToHex, getRandom, hexToBytes } from "../lib/utils";
import { v4 as uuidv4 } from 'uuid';
import { interpret } from 'xstate';

import SS, { StoredTypePrefix } from '../services/StorageService';
import GuardianMachine from '../machines/GuardianMachine';
import { Message, OutboundMessageDict } from "./Message";
import Contact from "./Contact";
import { MessageTypes } from "../managers/MessagesManager";
import { RecoveryPlanResponse } from "./MessagePayload";
import { SenderFunction } from "../services/DigitalAgentService";

export enum GuardianState {
    INIT = 'INIT',
    SENDING_ACCEPT = 'SENDING_ACCEPT',
    SENDING_DECLINE = 'SENDING_DECLINE',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
}

interface GuardianDict {
    pk: string,
    vaultPk: string,
    recoveryPlanPk: string, // i.e. theirPk local to their vault for this recovery plan
    contactPk: string,

    name: string,
    shares: string[],
    description: string,
    archived: boolean,
    state: GuardianState,
}

export default class Guardian {
    pk: string
    vaultPk: string

    recoveryPlanPk: string
    contactPk: string
    name: string
    description: string
    shares: string[]
    archived: boolean

    _state: GuardianState
    fsm: any
    getContact: (pk: string) => Contact

    constructor(pk: string, vaultPk: string, recoveryPlanPk: string, contactPk: string,
            name: string, description: string, shares: string[],
            state: GuardianState, archived: boolean, getContact: (pk: string) => Contact, sender: SenderFunction) {
        this.pk = pk
        this.vaultPk = vaultPk
        this.recoveryPlanPk = recoveryPlanPk
        this.contactPk = contactPk
        this.name = name
        this.description = description
        this.shares = shares
        this._state = state
        this.archived = archived
        this.getContact = getContact
        if(![GuardianState.ACCEPTED, GuardianState.DECLINED].includes(state)) {
            this.fsm = interpret(GuardianMachine.withContext({
                guardian: this,
                sender: sender,
            }))
            this.fsm.onTransition((context: {guardian: Guardian}, event) => {
                if(context.guardian)
                    console.log('[RecoveryPlan.fsm.onTransition]', context.guardian.toString(), event)
                else
                    console.log('[RecoveryPlan.fsm.onTransition]', event)
            })
            this.fsm.start(this._state)
        }
    }
    get contact(): Contact {
        return this.getContact(this.contactPk)
    }
    get state(): GuardianState {
        if(this.fsm)
            return this.fsm.getSnapshot().value
        return this._state
    }
    static create(name: string, description: string,
            vaultPk: string, recoveryPlanPk: string,
            shares: string[], contactPk: string,
            getContact: (pk: string) => Contact,
            sender: SenderFunction): Guardian {
        const pk = StoredTypePrefix.guardian + uuidv4()
        const guardian = new Guardian(pk, vaultPk, recoveryPlanPk, contactPk,
            name, description, shares, GuardianState.INIT, false,
            getContact, sender)
        return guardian
    }
    static fromDict(data: GuardianDict, getContact: (pk: string) => Contact,
            sender: SenderFunction): Guardian {
        const guardian = new Guardian(
            data.pk, data.vaultPk, data.recoveryPlanPk, data.contactPk,
            data.name, data.description, data.shares, data.state, data.archived,
            getContact, sender)
        return guardian
    }
    toDict(): GuardianDict {
        return {
            pk: this.pk,
            vaultPk: this.vaultPk,
            recoveryPlanPk: this.recoveryPlanPk,
            contactPk: this.contactPk,
            name: this.name,
            description: this.description,
            shares: this.shares,
            archived: this.archived,
            state: this.state,
        }
    }
    toString(): string {
        return 'Guardian<'+[this.pk, this.name, this.contactPk]+'>'
    }
    async save(): Promise<void> {
        await SS.save(this.pk, this.toDict())
    }
    // message flows
    responseMsg(response: 'accept' | 'reject'): OutboundMessageDict {
        const data: RecoveryPlanResponse = {
            recoveryPlanPk: this.recoveryPlanPk,
            response: response,
        }
        const contact = this.contact
        const message = Message.forContact(contact, data,
            MessageTypes.recovery.response, '0.1')
        message.encryptBox(contact.private_key)
        return message.outboundFinal()
    }
}
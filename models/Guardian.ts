import { base64toBytes, bytesToBase64, bytesToHex, getRandom, hexToBytes } from "../lib/utils";
import { v4 as uuidv4 } from 'uuid';
import secrets from 'secrets.js-grempe';
import { interpret } from 'xstate';

import SS, { StoredTypePrefix } from '../services/StorageService';
import GuardianMachine from '../machines/GuardianMachine';

enum GuardianState {
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

    constructor(pk: string, vaultPk: string, recoveryPlanPk: string, contactPk: string,
            name: string, description: string, shares: string[],
            state: GuardianState = GuardianState.INIT, archived: boolean = false) {
        this.pk = pk
        this.vaultPk = vaultPk
        this.recoveryPlanPk = recoveryPlanPk
        this.contactPk = contactPk
        this.name = name
        this.description = description
        this.shares = shares
        this._state = state
        this.archived = archived
        // this.fsm = interpret(GuardianMachine.withContext({})
    }
    get state(): GuardianState {
        if(this.fsm)
            return this.fsm.getSnapshot().value
        return this._state
    }
    static create(name: string, description: string,
            vaultPk: string, recoveryPlanPk: string, shares: string[], contactPk: string): Guardian {
        const pk = StoredTypePrefix.guardian + uuidv4()
        const guardian = new Guardian(pk, vaultPk, recoveryPlanPk, contactPk, name, description, shares)
        guardian._state = GuardianState.INIT
        return guardian
    }
    static fromDict(data: GuardianDict): Guardian {
        const guardian = new Guardian(
            data.pk, data.vaultPk, data.recoveryPlanPk, data.contactPk,
            data.name, data.description, data.shares, GuardianState.INIT)
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
}
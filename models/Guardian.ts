import { v4 as uuidv4 } from 'uuid';
import { interpret } from 'xstate';

import SS, { StoredTypePrefix } from '../services/StorageService';
import GuardianMachine from '../machines/GuardianMachine';
import { Message, OutboundMessageDict } from "./Message";
import Contact from "./Contact";
import { MessageTypes } from "../managers/MessageTypes";
import { RecoverCombineManifest, RecoverCombineResponse, RecoverSplitResponse } from "./MessagePayload";
import { SenderFunction } from "../services/DigitalAgentService";
import { ManifestDict } from "./RecoverSplit";
import { PublicKey, VerifyKey } from '../lib/nacl';

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
    manifest: ManifestDict, // i.e. theirPk local to their vault for this recovery plan
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

    manifest: ManifestDict
    contactPk: string
    name: string
    description: string
    shares: string[]
    archived: boolean

    _state: GuardianState
    fsm: any
    getContact: (pk: string) => Contact

    constructor(pk: string, vaultPk: string, manifest: ManifestDict, contactPk: string,
            name: string, description: string, shares: string[],
            state: GuardianState, archived: boolean, getContact: (pk: string) => Contact, sender: SenderFunction) {
        this.pk = pk
        this.vaultPk = vaultPk
        this.manifest = manifest
        this.contactPk = contactPk
        this.name = name
        this.description = description
        this.shares = shares
        this._state = state
        this.archived = archived
        this.getContact = getContact
        if(![GuardianState.ACCEPTED, GuardianState.DECLINED].includes(state)) {
            this.initFSM(sender)
        }
    }
    initFSM(sender: SenderFunction) {
        this.fsm = interpret(GuardianMachine.withContext({
            guardian: this,
            sender: sender,
        }))
        this.fsm.onTransition((state: {context: {guardian: Guardian}}) => {
            console.log('[RecoverSplit.fsm.onTransition]', state.context.guardian.toString(), event)
        })
        console.log('[Guardian.initFSM]', this._state)
        this.fsm.start(this._state)
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
            vaultPk: string, manifest: ManifestDict,
            shares: string[], contactPk: string,
            getContact: (pk: string) => Contact,
            sender: SenderFunction): Guardian {
        const pk = StoredTypePrefix.guardian + uuidv4()
        const guardian = new Guardian(pk, vaultPk, manifest, contactPk,
            name, description, shares, GuardianState.INIT, false,
            getContact, sender)
        return guardian
    }
    static fromDict(data: GuardianDict, getContact: (pk: string) => Contact,
            sender: SenderFunction): Guardian {
        const guardian = new Guardian(
            data.pk, data.vaultPk, data.manifest, data.contactPk,
            data.name, data.description, data.shares, data.state, data.archived,
            getContact, sender)
        return guardian
    }
    toDict(): GuardianDict {
        return {
            pk: this.pk,
            vaultPk: this.vaultPk,
            manifest: this.manifest,
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
    // message flows for recoverSplit
    responseMsg(response: 'accept' | 'decline'): OutboundMessageDict {
        const data: RecoverSplitResponse = {
            recoverSplitPk: this.manifest.recoverSplitPk,
            response: response,
        }
        const contact = this.contact
        const message = Message.forContact(contact, data,
            MessageTypes.recoverSplit.response, '0.1')
        message.encryptBox(contact.private_key)
        return message.outboundFinal()
    }
    // share manifest for recoverCombine (typically Vault)
    manifestMsg(receiver: {did: string, verify_key: VerifyKey, public_key: PublicKey}): OutboundMessageDict {
        const data: RecoverCombineManifest = {
            manifest: this.manifest,
        }
        const contact = this.contact
        const message = Message.forNonContact(contact.vault, {
                did: receiver.did, 
                verify_key: receiver.verify_key,
                public_key: receiver.public_key,
                name: contact.name
            },
            data, MessageTypes.recoverCombine.manifest, '0.1')
        message.encryptBox(contact.vault.private_key)
        return message.outboundFinal()
    }
    // response for recoverCombine
    recoverCombineResponseMsg(response: 'accept' | 'decline',
            receiver: {did: string, verify_key: VerifyKey, public_key: PublicKey})
            : OutboundMessageDict {
        const data: RecoverCombineResponse = {
            recoverSplitPk: this.manifest.recoverSplitPk,
            response: response,
        }
        if(response === 'accept')
            data.shares = this.shares
        const contact = this.contact
        const message = Message.forNonContact(contact.vault, {
                did: receiver.did, 
                verify_key: receiver.verify_key,
                public_key: receiver.public_key,
                name: contact.name
            },
            data, MessageTypes.recoverCombine.response, '0.1')
        message.encryptBox(contact.vault.private_key)
        return message.outboundFinal()
    }
}
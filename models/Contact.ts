import base58 from 'bs58'
import { v4 as uuidv4 } from 'uuid';
import { interpret } from 'xstate';

import { encryptionKey } from '../lib/utils'
import { VerifyKey, PrivateKey, PublicKey } from '../lib/nacl';

import SS, { StoredTypePrefix } from '../services/StorageService';
import ContactMachine from '../machines/ContactMachine';
import { Message, OutboundMessageDict } from './Message';
import { MessageTypes } from '../managers/MessageTypes';
import Vault from './Vault';
import { ContactAccept, ContactInvite } from './MessagePayload';
import { ContactPk, Model, ModelDict } from './types'

export enum ContactState {
    INIT = 'INIT',
    INBOUND = 'INBOUND',
    PENDING = 'PENDING',
    CAN_RESEND_INVITE = 'CAN_RESEND_INVITE',
    ESTABLISHED = 'ESTABLISHED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED',
    BLOCKED = 'BLOCKED',
}

interface ContactDict extends ModelDict {
    pk: ContactPk,
    vaultPk: string,
    did: string,
    name: string,
    email: string,
    private_key: string,
    public_key: string,
    their_public_key: string,
    their_verify_key: string,
    their_contact_public_key: string,
    digital_agent: string,
    state: ContactState,
    //TODO created updated
    metadata?: any
}

class Contact implements Model {
    pk: ContactPk
    vaultPk: string
    did: string // TODO: change to DID
    name: string
    email: string
    private_key: PrivateKey
    public_key: PublicKey
    their_public_key: PublicKey
    their_verify_key: VerifyKey
    their_contact_public_key: PublicKey
    digital_agent: string
    private _state: ContactState
    private _vault: Vault
    fsm: any

    constructor(
            pk: ContactPk,
            vaultPk: string,
            did: string,
            name: string,
            email: string,
            private_key: PrivateKey,
            public_key: PublicKey,
            their_public_key: PublicKey,
            their_verify_key: VerifyKey,
            their_contact_public_key: PublicKey,
            digital_agent: string,
            state: ContactState,
            vault: Vault) {
        this.pk = pk
        this.vaultPk = vaultPk
        this.did = did
        this.name = name
        this.email = email
        this.private_key = private_key
        this.public_key = public_key
        this.their_public_key = their_public_key
        this.their_verify_key = their_verify_key
        this.their_contact_public_key = their_contact_public_key
        this.digital_agent = digital_agent
        this._state = state
        this._vault = vault
        if(![ContactState.ESTABLISHED, ContactState.ARCHIVED].includes(state))
            this.initFSM()
    }
    initFSM() {
        this.fsm = interpret(ContactMachine.withContext({
            contact: this,
            sender: this.vault.sender,
        }))
        this.fsm.onTransition((state: {context: {contact: Contact}}) => {
            console.log('[Contact.fsm.onTransition]', state.context.contact.toString(), event)
        })
        this.fsm.start(this._state)
    }
    get vault(): Vault {
        return this._vault
    }
    get state(): ContactState {
        if(this.fsm)
            return this.fsm.getSnapshot().value
        return this._state
    }
    get b58_private_key(): string {
        return base58.encode(this.private_key)
    }
    get b58_public_key(): string {
        return base58.encode(this.public_key)
    }
    get b58_their_public_key(): string {
        return base58.encode(this.their_public_key)
    }
    get b58_their_verify_key(): string {
        return base58.encode(this.their_verify_key)
    }
    get b58_their_contact_public_key(): string {
        return base58.encode(this.their_contact_public_key)
    }
    static async create(vaultPk: string, did: string,
            name: string,email: string,
            their_public_key: PublicKey,
            their_verify_key: VerifyKey,
            their_contact_public_key: PublicKey,
            digital_agent: string,
            state: ContactState, vault: Vault) {
        let pk = StoredTypePrefix.contact + uuidv4()
        let enc_key_pair = await encryptionKey()
        return new Contact(pk, vaultPk, did, name, email,
            enc_key_pair.secretKey, enc_key_pair.publicKey,
            their_public_key, their_verify_key, their_contact_public_key,
            digital_agent, state, vault)
    }
    async save(): Promise<void> {
        return SS.save(this.pk, this.toDict())
    }
    toString(): string {
        return 'Contact<' + [this.pk, this.did, this.name, this.state].join(', ') + '>'
    }
    toDict(): ContactDict {
        return {
            pk: this.pk,
            vaultPk: this.vaultPk,
            did: this.did,
            name: this.name,
            email: this.email,
            private_key: base58.encode(this.private_key),
            public_key: base58.encode(this.public_key),
            their_public_key: this.their_public_key ? base58.encode(this.their_public_key) : '',
            their_verify_key: this.their_verify_key ? base58.encode(this.their_verify_key) : '',
            their_contact_public_key: this.their_contact_public_key ? base58.encode(this.their_contact_public_key) : '',
            digital_agent: this.digital_agent || '',
            state: this.state,
        }
    }
    static fromDict(data: ContactDict, vault: Vault): Contact {
        const private_key = base58.decode(data.private_key)
        const public_key = base58.decode(data.public_key)
        const their_public_key = data.their_public_key != '' ? base58.decode(data.their_public_key) : Uint8Array.from([])
        const their_verify_key = data.their_verify_key != '' ? base58.decode(data.their_verify_key) : Uint8Array.from([])
        const their_contact_public_key = data.their_contact_public_key != '' ? base58.decode(data.their_contact_public_key) : Uint8Array.from([])
        return new Contact(
            data.pk, data.vaultPk, data.did, data.name, data.email,
            private_key, public_key,
            their_public_key, their_verify_key, their_contact_public_key,
            data.digital_agent,
            data.state, vault
        )
    }
    isInviteExpired(): boolean {
        throw new Error('Not implemented')
    }
    // invite message
    inviteMsg(): OutboundMessageDict {
        const data: ContactInvite = {
            did: this.vault.did,
            name: this.vault.name,
            email: this.vault.email,
            verify_key: this.vault.b58_verify_key,
            public_key: this.vault.b58_public_key,
            contact_public_key: this.b58_public_key,
        }
        const message = Message.forContact(this, data,
            MessageTypes.contact.invite, '0.1');
        // null the sender sub key because we're not using it (even though
        // the contact will receive it inside the encrypted msg, will use in future
        message.sender.sub_public_key = Uint8Array.from([])
        // they don't have our contact public key for verification yet so we use our vault key for box verif
        message.encryptBox(this.vault.private_key)
        return message.outboundFinal();
    }
    // accept message
    acceptInviteMsg(): OutboundMessageDict {
        const data: ContactAccept = {
            did: this.vault.did,
            email: this.vault.email,
            verify_key: this.vault.b58_verify_key,
            public_key: this.vault.b58_public_key,
            contact_public_key: this.b58_public_key,
        }
        const message = Message.forContact(this, data,
            MessageTypes.contact.accept, '0.1');
        message.encryptBox(this.private_key)
        return message.outboundFinal();
    }
}

export default Contact
import base58 from 'bs58'
const bip39 = require('bip39')

import { v4 as uuidv4 } from 'uuid';

import { SigningKey, VerifyKey, PrivateKey, PublicKey, SignedMessage } from '../lib/nacl';
import { signMsg, signingKeyFromWords, encryptionKeyFromWords, encryptionKey, getRandom } from '../lib/utils'
import { StoredType, StoredTypePrefix } from './StorageInterface';

export enum ContactState {
    INIT = 'INIT',
    REQUESTED = 'REQUESTED',
    INBOUND = 'INBOUND',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    BLOCKED = 'BLOCKED',
}
interface ContactDict {
    pk: string,
    vault_pk: string,
    did: string,
    name: string,
    private_key: string,
    public_key: string,
    their_public_key: string,
    their_verify_key: string,
    their_contact_public_key: string,
    digital_agent: string,
    state: string,
    //TODO created updated
    metadata?: any
}

class Contact {
    pk: string
    vault_pk: string
    did: string // TODO: change to DID
    name: string
    private_key: PrivateKey
    public_key: PublicKey
    their_public_key: PublicKey
    their_verify_key: VerifyKey
    their_contact_public_key: PublicKey
    digital_agent: string
    state: ContactState

    constructor(
            pk: string,
            vault_pk: string,
            did: string,
            name: string,
            private_key: PrivateKey,
            public_key: PublicKey,
            their_public_key: PublicKey,
            their_verify_key: VerifyKey,
            their_contact_public_key: PublicKey,
            digital_agent: string,
            state: ContactState) {
        this.pk = pk
        this.vault_pk = vault_pk
        this.did = did
        this.name = name
        this.private_key = private_key
        this.public_key = public_key
        this.their_public_key = their_public_key
        this.their_verify_key = their_verify_key
        this.their_contact_public_key = their_contact_public_key
        this.digital_agent = digital_agent
        this.state = state
    }
    get b58_public_key(): string {
        return base58.encode(this.public_key)
    }
    get b58_private_key(): string {
        return base58.encode(this.private_key)
    }
    get b58_their_public_key(): string {
        return base58.encode(this.their_public_key)
    }
    get b58_their_verify_key(): string {
        return base58.encode(this.their_verify_key)
    }
    static async create(vault_pk: string, did: string, name: string, 
            their_public_key: PublicKey, their_verify_key: VerifyKey, their_contact_public_key: PublicKey,
            digital_agent: string, state: ContactState=ContactState.INIT) {
        let pk = StoredTypePrefix.contact + uuidv4()
        let enc_key_pair = await encryptionKey()
        return new Contact(pk, vault_pk, did, name, 
            enc_key_pair.secretKey, enc_key_pair.publicKey,
            their_public_key, their_verify_key, their_contact_public_key,
            digital_agent, state)
    }
    toString(): string {
        return [this.pk, this.did, this.name, this.state].join(' ')
    }
    toDict(): ContactDict {
        return {
            pk: this.pk,
            vault_pk: this.vault_pk,
            did: this.did,
            name: this.name,
            private_key: base58.encode(this.private_key),
            public_key: base58.encode(this.public_key),
            their_public_key: this.their_public_key ? base58.encode(this.their_public_key) : '',
            their_verify_key: this.their_verify_key ? base58.encode(this.their_verify_key) : '',
            their_contact_public_key: this.their_contact_public_key ? base58.encode(this.their_contact_public_key) : '',
            digital_agent: this.digital_agent || '',
            state: this.state
        }
    }
    static fromDict(data: ContactDict): Contact {
        const private_key = base58.decode(data.private_key)
        const public_key = base58.decode(data.public_key)
        const their_public_key = data.their_public_key == '' ? base58.decode(data.their_public_key) : Uint8Array.from([])
        const their_verify_key = data.their_verify_key == '' ? base58.decode(data.their_verify_key) : Uint8Array.from([])
        const their_contact_public_key = data.their_contact_public_key == '' ? base58.decode(data.their_contact_public_key) : Uint8Array.from([])
        return new Contact(
            data.pk, data.vault_pk, data.did, data.name,
            private_key, public_key,
            their_public_key, their_verify_key, their_contact_public_key,
            data.digital_agent,
            ContactState[data.state]
        )
    }
}

export default Contact
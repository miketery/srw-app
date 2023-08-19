import base58 from 'bs58'
const bip39 = require('bip39')

import { v4 as uuidv4 } from 'uuid';

import { SigningKey, VerifyKey, PrivateKey, PublicKey, SignedMessage } from '../lib/nacl';
import { sign_msg, signingKeyFromWords, encryptionKeyFromWords, encryptionKey, getRandom } from '../lib/utils'
import { StoredTypes, StoredTypesPrefix } from './SI';

enum ContactState {
    INIT = 'init',
    REQUESTED = 'requested',
    INBOUND = 'inbound',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    BLOCKED = 'blocked',
}
interface ContactDict {
    pk: string,
    did: string,
    name: string,
    private_key: string,
    public_key: string,
    their_public_key: string,
    their_verify_key: string,
    state: string,
    //TODO created updated
    metadata?: any
}

export default class Contact {
    pk: string
    did: string // TODO: change to DID
    name: string
    private_key: PrivateKey
    public_key: PublicKey
    their_public_key: PublicKey|null
    their_verify_key: VerifyKey|null
    state: ContactState

    constructor(
            pk: string,
            did: string,
            name: string,
            private_key: PrivateKey,
            public_key: PublicKey,
            their_public_key: PublicKey|null,
            their_verify_key: VerifyKey|null,
            state: ContactState) {
        this.pk = pk
        this.did = did
        this.name = name
        this.private_key = private_key
        this.public_key = public_key
        this.their_public_key = their_public_key
        this.their_verify_key = their_verify_key
        this.state = state
    }
    static async create(did: string, name: string, their_public_key: PublicKey|null, their_verify_key: VerifyKey|null) {
        let pk = StoredTypesPrefix.contacts + uuidv4()
        let enc_key_pair = await encryptionKey()
        return new Contact(pk, did, name, 
            enc_key_pair.secretKey, enc_key_pair.publicKey,
            their_public_key, their_verify_key,
            ContactState.INIT)
    }
    to_string(): string {
        return [this.pk, this.did, this.name].join(' ')
    }
    to_dict(): ContactDict {
        return {
            pk: this.pk,
            did: this.did,
            name: this.name,
            private_key: base58.encode(this.private_key),
            public_key: base58.encode(this.public_key),
            their_public_key: this.their_public_key ? base58.encode(this.their_public_key) : '',
            their_verify_key: this.their_verify_key ? base58.encode(this.their_verify_key) : '',
            state: this.state
        }
    }
    static from_dict(data: ContactDict): Contact {
        let private_key = base58.decode(data.private_key)
        let public_key = base58.decode(data.public_key)
        let their_public_key = data.their_public_key == '' ? base58.decode(data.their_public_key) : null
        let their_verify_key = data.their_verify_key == '' ? base58.decode(data.their_verify_key) : null
        return new Contact(
            data.pk, data.did, data.name,
            private_key, public_key,
            their_public_key, their_verify_key,
            ContactState[data.state]
        )
    }
}



import base58 from 'bs58'
const bip39 = require('bip39')

import { v4 as uuidv4 } from 'uuid';

// Import the required classes, modules or types here
import { SigningKey, VerifyKey, PrivateKey, PublicKey, SignedMessage } from '../lib/nacl';
import { signMsg, signingKeyFromWords, encryptionKeyFromWords, getRandom } from '../lib/utils'
import SS, { StoredType, StoredTypePrefix } from '../services/StorageService';
import { entropyToMnemonic } from 'bip39';


export default class Vault {
    uuid: string;
    name: string;
    email: string;
    display_name: string;
    digital_agent_host: string;
    words: string; // 32 random bytes
    // Stretch using hashlib.pbkdf2_hmac sha512 2048 rounds
    signing_key: SigningKey; // appends 'signing' to ${words}
    verify_key: VerifyKey;
    private_key: PrivateKey; // appends 'encryption' to ${words}
    public_key: PublicKey;
    registered: boolean;
    short_code: string;

    constructor(
            uuid: string,
            name: string,
            email: string,
            display_name: string,
            digital_agent_host: string,
            words: string,
            signing_key: SigningKey, verify_key: VerifyKey,
            private_key: PrivateKey, public_key: PublicKey,
            registered: boolean, short_code: string) {
        this.uuid = uuid;
        this.name = name;
        this.email = email;
        this.display_name = display_name;
        this.digital_agent_host = digital_agent_host;
        this.words = words;
        this.signing_key = signing_key;
        this.verify_key = verify_key;
        this.private_key = private_key;
        this.public_key = public_key;
        this.registered = registered;
        this.short_code = short_code;
    }
    get pk(): string {
        return StoredTypePrefix[StoredType.vault] + this.b58_verify_key;
    }
    get did(): string {
        return `did:arx:${this.b58_verify_key}`;
    }
    get b58_verify_key(): string { // public signing key in base58
        return base58.encode(this.verify_key);
    }
    get b58_signing_key(): string {
        return base58.encode(this.signing_key);
    }
    get b58_private_key(): string {
        return base58.encode(this.private_key);
    }
    get b58_public_key(): string {
        return base58.encode(this.public_key);
    }
    static async create(name: string, email: string, display_name: string,
            digital_agent_host: string, words: string): Promise<Vault> {
        if(!words || words.length === 0) {
            const entropy = await getRandom(32);
            words = entropyToMnemonic(Buffer.from(entropy));
        }
        const signing_key = signingKeyFromWords(words);
        const encryption_key = encryptionKeyFromWords(words);
        return new Vault(
            uuidv4(), name, email, display_name, digital_agent_host, words,
            signing_key.secretKey, signing_key.publicKey,
            encryption_key.secretKey, encryption_key.publicKey,
            false, '');
    }
    toDict() {
        return {
            'pk': this.pk,
            'uuid': this.uuid,
            'name': this.name,
            'email': this.email,
            'display_name': this.display_name,
            'digital_agent_host': this.digital_agent_host,
            'words': this.words,
            'signing_key': this.b58_signing_key,
            'verify_key': this.b58_verify_key,
            'private_key': this.b58_private_key,
            'public_key': this.b58_public_key,
            'registered': this.registered,
            'short_code': this.short_code
        };
    }
    static fromDict(data: any): Vault {
        let signing_key = base58.decode(data['signing_key']);
        let verify_key = base58.decode(data['verify_key']);
        let private_key = base58.decode(data['private_key']);
        let public_key = base58.decode(data['public_key']);
        return new Vault(
            data['uuid'], data['name'], data['email'], data['display_name'],
            data['digital_agent_host'], data['words'],
            signing_key, verify_key, private_key, public_key,
            data['registered'], data['short_code']
        );
    }
    signPayload(payload: any): {signed: string, verify_key: string} {
        payload.sig_ts = Math.floor(Date.now() / 1000);
        const data = JSON.stringify(payload);//.encode('utf-8');
        const data_bytes = Buffer.from(data, 'utf-8');
        const signed = this.sign(data_bytes);
        return {
            'signed': Buffer.from(signed).toString('base64'),
            'verify_key': this.b58_verify_key
        };
    }
    sign(data: any): SignedMessage {
        return signMsg(data, this.signing_key);
    }
    async save() {
        return SS.save(this.pk, this.toDict());
    }
}

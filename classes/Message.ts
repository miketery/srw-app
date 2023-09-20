import { VerifyKey, PublicKey, PrivateKey } from "../lib/nacl";
import base58 from 'bs58'
import { v4 as uuidv4 } from 'uuid';


import Vault from "./Vault";
import { base64toBytes, box, bytesToBase64, open_box, open_sealed_box, sealed_box } from "../lib/utils";
import Contact from "./Contact";
import { DEBUG } from "../config";
import { StoredTypePrefix } from "./StorageInterface";
// Interfaces for TypedDicts

interface SenderDict {
    did: string;
    verify_key: string;
    public_key: string;
    sub_public_key?: string;
    name: string;
}

interface ReceiverDict extends SenderDict {}

interface MessageDict {
    pk: string;
    sender: SenderDict;
    receiver: ReceiverDict;
    encryption: string | null;
    data: Record<string, any> | string; // base64 string if encrypted
    type_name: string;
    type_version: string;
}

interface SignedPayloadDict {
    signed: string;  // this will have the message dict as a byte encoded string
    signature: string;
}

// Assuming DID, VerifyKey, PublicKey, b58encodeKey, and json are already defined somewhere in your TypeScript code

class SenderReceiver {
    did: string;
    verify_key: VerifyKey;
    public_key: PublicKey; 
    sub_public_key: PublicKey | null;
    name: string;

    constructor(did: string, verify_key: VerifyKey, public_key: PublicKey, sub_public_key: PublicKey | null, name: string) {
        this.did = did;
        this.verify_key = verify_key;
        this.public_key = public_key; // general / high level
        this.sub_public_key = sub_public_key; // specific / low level
        this.name = name;
    }
    toString(): string {
        return JSON.stringify(this.toDict(), null, 4);
    }
    toDict(): SenderDict {
        return {
            did: this.did.toString(),
            verify_key: base58.encode(this.verify_key),
            public_key: base58.encode(this.public_key),
            sub_public_key: this.sub_public_key ? base58.encode(this.sub_public_key) : undefined,
            name: this.name
        };
    }
    getEncryptionPublicKey(): PublicKey {
        if(this.sub_public_key && this.sub_public_key.length > 0)
            return this.sub_public_key
        return this.public_key
    }
}
class Sender extends SenderReceiver {
    static fromVault(vault: Vault): Sender {
        return new Sender(
            vault.did,
            vault.verify_key,
            vault.public_key,
            Uint8Array.from([]),
            vault.name
        );
    }
    static fromContact(vault: Vault, contact: Contact): Sender {
        return new Sender(
            vault.did,
            vault.verify_key,
            vault.public_key,
            contact.public_key,
            vault.name
        );
    }
}
class Receiver extends SenderReceiver {
    static fromContact(contact: Contact): Receiver {
        return new Receiver(
            contact.did,
            contact.their_verify_key,
            contact.their_public_key,
            contact.their_contact_public_key,
            contact.name
        );
    }
}

class Message {
    pk: string;
    type: 'inbound' | 'outbound';
    
    sender: Sender;
    receiver: Receiver;

    // hold decrytped data (i.e. inbound after decrypt, or outbound before encrypt)
    _data: Record<string, any>;
    
    // _inbound --> decrypt() --> data
    _inbound: string; // from someone, could be encrytped
    
    // data --> encrypt() --> _outbound
    _outbound: string; // to someone, could be encrypted

    // mostly metadata for debugging, could be made private later and removed
    type_name: string;
    type_version: string;
    
    encrypt: boolean;
    encryption: string | null;
    _decrypted: any | null;

    constructor(pk: string|null, type: 'inbound'|'outbound',
            sender: Sender, receiver: Receiver,
            type_name: string, type_version: string,
            encryption: string | null = null, encrypt: boolean = true) {
        this.pk = pk === null ? StoredTypePrefix.message + uuidv4() : pk;
        this.type = type;
        this.sender = sender;
        this.receiver = receiver;
        this.type_name = type_name;
        this.type_version = type_version;
        this.encrypt = encrypt;
        this.encryption = encryption;
        // TODO: expiry (valid after / before)
    }
    setData(data: Record<string, any>): void {
        this._data = data;
    }
    setOutboundFromDataNoEncryption(): void {
        if(this.encrypt)
            throw new Error("Cannot set outbound unecrypted data when encrypt is true");
        this.setOutbound(JSON.stringify(this._data));
    }
    setInbound(data: string): void {
        this._inbound = data;
    }
    setOutbound(data: string): void {
        this._outbound = data;
    }
    getData(): Record<string, any> {
        if(!this._data)
            throw new Error("No data set");
        return this._data;
    }
    decrypt(receiver_private_key: PrivateKey): boolean {
        if(!this._inbound)
            throw new Error("No inbound data to decrypt");
        if(!this.encryption || !this.encrypt)
            throw new Error("No encryption type set or encrypt set to false");
        if(typeof(this._inbound) != 'string') // todo: check for base64
            throw new Error("Message data is not a string");
        const enctypted_bytes = base64toBytes(this._inbound);
        const sender_public_key = this.sender.getEncryptionPublicKey();
        console.log("Decrypting encryption type " + this.encryption + " with sender public key " + base58.encode(sender_public_key));
        if (this.encryption === 'X25519Box') {
            if (!sender_public_key)
                throw new Error("Sender public key required to decrypt")
            const data_bytes = open_box(enctypted_bytes, sender_public_key, receiver_private_key);
            if (!data_bytes)
                return false;
            this._data = JSON.parse(new TextDecoder().decode(data_bytes));
        } else if (this.encryption === 'X25519SealedBox') {
            const data_bytes = open_sealed_box(enctypted_bytes, receiver_private_key)
            if (!data_bytes)
                return false;
            this._data = JSON.parse(new TextDecoder().decode(data_bytes));
        }
        return true;
    }
    encryptSealedBox(): void {
        const data_bytes = new TextEncoder().encode(JSON.stringify(this._data));
        this._outbound = bytesToBase64(
            sealed_box(data_bytes, this.receiver.public_key));
        this.encryption = 'X25519SealedBox';
    }
    encryptBox(sender_private_key: PrivateKey): void {
        // TODO check that sender getEncryptionPublicKey matches sender_private_key
        const data_bytes = new TextEncoder().encode(JSON.stringify(this._data));
        const reciever_public_key = this.receiver.getEncryptionPublicKey()
        this._outbound = bytesToBase64(
            box(data_bytes, reciever_public_key, sender_private_key));
        this.encryption = 'X25519Box';
    }
    outboundFinal(): MessageDict {
        if (this.encrypt && !this._outbound) {
            throw new Error("Encrypt set to true but not yet encrypted");
        }
        const data = this.encrypt ? this._outbound : this._data
        const outbound = {
            pk: this.pk,
            sender: this.sender.toDict(),
            receiver: this.receiver.toDict(),
            encryption: this.encryption,
            data: data,
            type_name: this.type_name,
            type_version: this.type_version,
            ...(DEBUG && !this.encrypt ? {'__DEBUG': this._data} : {})
        };
        return outbound;
    }
    toDict(): MessageDict {
        return {
            pk: this.pk,
            sender: this.sender.toDict(),
            receiver: this.receiver.toDict(),
            encryption: this.encryption,
            data: this._data,
            type_name: this.type_name,
            type_version: this.type_version,
        }
    }
    static inbound(message: MessageDict): Message {
        return Message.fromDict({
            ...message, 
            inbound: message.data,
            type: 'inbound',
            data: {} // we know it's inbound so we blank out the data
        });
    }
    static fromDict(message: any): Message {
        const msg = new Message(
            message.pk,
            message.type,
            new Sender(
                message.sender.did,
                base58.decode(message.sender.verify_key),
                base58.decode(message.sender.public_key),
                message.sender.sub_public_key ? base58.decode(message.sender.sub_public_key) : null,
                message.sender.name
            ),
            new Receiver(
                message.receiver.did,
                base58.decode(message.receiver.verify_key),
                base58.decode(message.receiver.public_key),
                message.receiver.sub_public_key ? base58.decode(message.receiver.sub_public_key) : null,
                message.receiver.name
            ),
            message.type_name,
            message.type_version,
            message.encryption || null,
            !!message.encryption
        );
        if (message.type === 'inbound' && message.inbound)
            msg.setInbound(message.inbound)
        if (message.data)
            msg.setData(message.data)
        if (message.outboud)
            msg.setOutbound(message.outbound)
        return msg
    }
    static forContact(vault: Vault, contact: Contact,
            data: Record<string, any>,
            type_name: string, type_version: string): Message {
        const msg = new Message(
            null,
            'outbound',
            Sender.fromContact(vault, contact),
            Receiver.fromContact(contact),
            type_name, type_version,
            'X25519Box', true
        );
        msg.setData(data);
        return msg;
    }
}

export { MessageDict, SignedPayloadDict, SenderDict, ReceiverDict}
export { Sender, Receiver, Message };

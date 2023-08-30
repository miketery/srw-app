import { VerifyKey, PublicKey, PrivateKey } from "../lib/nacl";
import base58 from 'bs58'


import Vault from "./Vault";
import { base64toBytes, box, bytesToBase64, open_box, open_sealed_box, sealed_box } from "../lib/utils";
import Contact from "./Contact";
// Interfaces for TypedDicts

interface SenderDict {
    did: string;
    verify_key: string;
    public_key: string;
    name: string;
}

interface ReceiverDict extends SenderDict {}

interface MessageDict {
    sender: SenderDict;
    receiver: ReceiverDict;
    encryption: string | null;
    data: any | string; // base64 string if encrypted
    type_name: string;
    type_version: string;
    sig_ts?: number;
}

interface SignedPayloadDict {
    signed: string;  // this will have the message dict as a byte encoded string
    signature: string;
}

// Assuming DID, VerifyKey, PublicKey, b58encodeKey, and json are already defined somewhere in your TypeScript code

class Sender {
    did: string;
    verify_key: VerifyKey;
    public_key: PublicKey;
    name: string;

    constructor(did: string, verify_key: VerifyKey, public_key: PublicKey, name: string) {
        this.did = did;
        this.verify_key = verify_key;
        this.public_key = public_key;
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
            name: this.name
        };
    }

    static fromVault(vault: Vault): Sender {
        return new Sender(
            vault.did,
            vault.verify_key,
            vault.public_key,
            vault.name
        );
    }
}

class Receiver extends Sender {
    static fromContact(contact: Contact): Receiver {
        return new Receiver(
            contact.did,
            contact.their_verify_key,
            contact.their_public_key,
            contact.name
        );
    }
}

class Message {
    sender: Sender;
    receiver: Receiver;
    data: Record<string, any> | Uint8Array | string;
    type_name: string;
    type_version: string;
    sig_ts: number;
    encrypt: boolean;
    encryption: string | null;
    decrypted: any | null;
    encrypted: Uint8Array | null;

    constructor(sender: Sender, receiver: Receiver, 
            data: Record<string, any> | Uint8Array | string, 
            type_name: string, type_version: string,
            encryption: string | null = null, encrypt: boolean = true,
            sig_ts: number = 0) {
        this.sender = sender;
        this.receiver = receiver;
        this.data = data;
        this.type_name = type_name;
        this.type_version = type_version;
        this.sig_ts = 0; // will be set by SignedPayload class
        this.encrypt = encrypt;
        this.encryption = encryption;
        this.decrypted = null;
    }

    decrypt(receiver_private_key: PrivateKey, sender_public_key: PublicKey | null): boolean {
        if (!(this.data instanceof Uint8Array))
            throw new Error("Message data is not a Uint8Array");
        if (this.encryption === 'X25519Box') {
            if (!sender_public_key)
                throw new Error("Sender public key required to decrypt")
            const data_bytes = open_box(this.data, sender_public_key, receiver_private_key);
            if (!data_bytes)
                return false;
            this.decrypted = JSON.parse(new TextDecoder().decode(data_bytes));
        } else if (this.encryption === 'X25519SealedBox') {
            const data_bytes = open_sealed_box(this.data, receiver_private_key)
            if (!data_bytes)
                return false;
            this.decrypted = JSON.parse(new TextDecoder().decode(data_bytes));
        }
        return true;
    }

    encryptSealedBox(): void {
        const data_bytes = new TextEncoder().encode(JSON.stringify(this.data));
        this.encrypted = sealed_box(data_bytes, this.receiver.public_key);
        this.encryption = 'X25519SealedBox';
    }

    encryptBox(sender_private_key: PrivateKey): void {
        const data_bytes = new TextEncoder().encode(JSON.stringify(this.data));
        this.encrypted = box(data_bytes, this.receiver.public_key ,sender_private_key);
        this.encryption = 'X25519Box';
    }

    outboundFinal(): MessageDict {
        if (this.encrypt && !this.encryption) {
            throw new Error("Encrypt set to true but not yet encrypted");
        }
        let data = this.encrypt && this.encrypted != null ? bytesToBase64(this.encrypted) : this.data;
        return {
            sender: this.sender.toDict(),
            receiver: this.receiver.toDict(),
            encryption: this.encryption,
            data: data,
            type_name: this.type_name,
            type_version: this.type_version,
            sig_ts: 0 // will be set by SignedPayload class
        };
    }

    static inbound(message: MessageDict): Message {
        let data = message.encryption && typeof(message.data) === 'string' ? base64toBytes(message.data) : message.data;
        return new Message(
            new Sender(
                message.sender.did,
                base58.decode(message.sender.verify_key),
                base58.decode(message.sender.public_key),
                message.sender.name
            ),
            new Receiver(
                message.receiver.did,
                base58.decode(message.receiver.verify_key),
                base58.decode(message.receiver.public_key),
                message.receiver.name
            ),
            data,
            message.type_name,
            message.type_version,
            message.encryption || null,
            !!message.encryption,
            message.sig_ts
        );
    }
}

export { MessageDict, SignedPayloadDict, SenderDict, ReceiverDict}
export { Sender, Receiver, Message };

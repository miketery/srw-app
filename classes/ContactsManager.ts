import base58 from 'bs58';

import { PublicKey, VerifyKey } from '../lib/nacl';
import Vault from './Vault';
import Contact, { ContactState } from './Contact';
import SI, { StoredType } from './StorageInterface';
import { Message, MessageDict, Receiver, Sender } from './Message';


class ContactsManager {
    // private static _instance: ContactsManager;
    private _contacts: {string?: Contact};
    private _vault: Vault | null;
    // singleton constructor
    constructor(vault: Vault, contacts: {string?: Contact} = {}) { 
        this._contacts = contacts; 
        this._vault = vault;
    }
    // public static getInstance(): ContactsManager {
    //     if (!ContactsManager._instance) {
    //         ContactsManager._instance = new ContactsManager();
    //     }
    //     return ContactsManager._instance;
    // }
    clear() { this._contacts = {}; }
    async deleteContact(contact: Contact): Promise<void> {
        await SI.delete(contact.pk);
        delete this._contacts[contact.pk];
    }
    async saveContact(contact: Contact): Promise<void> {
        await SI.save(contact.pk, contact.toDict())
        this._contacts[contact.pk] = contact;
    }
    async loadContacts(): Promise<{string?: Contact}> {
        if(!this._vault)
            throw new Error('Vault not set');
        const contacts: {string?: Contact} = {};
        const contacts_data = await SI.getAll(StoredType.contact, this._vault.pk);
        for (let contact_data of Object.values(contacts_data)) {
            const c = Contact.fromDict(contact_data);
            contacts[c.pk] = c;
        }
        this._contacts = contacts;
        return contacts;
    }
    getContacts(): {string?: Contact} {
        return this._contacts;
    }
    getContactsArray(): Contact[] {
        return Object.values(this._contacts);
    }
    getContact(pk: string): Contact {
        if(pk in this._contacts)
            return this._contacts[pk];
        throw new Error(`Contact not found: ${pk}`);
    }
    getContactByDid(did: string): Contact {
        const contact = this.getContactsArray().find(contact => contact.did === did);
        if (!contact) {
            throw new Error(`Contact not found: ${did}`);
        }
        return contact;
    }
    getContactByName(name: string, raise_exception = false): Contact|undefined {
        const contact = this.getContactsArray().find(contact => contact.name === name);
        if (!contact && raise_exception) {
            throw new Error(`Contact not found: ${name}`);
        }
        return contact;
    }
    get vault(): Vault {
        if(!this._vault)
            throw new Error('Vault not set');
        return this._vault;
    }
    get length(): number {
        return Object.keys(this._contacts).length;
    }
    get index(): string[] {
        return Object.keys(this._contacts);
    }
    printContacts(): void {
        console.log('[ContactsManager.printContacts] ' + this.length + ' contacts for ' + this.vault.name)
        this.getContactsArray().forEach((contact: Contact) => {
            console.log(contact.toString());
        });
    }
    //########################################
    // CONTACT REQUEST FLOWS
    async addContact(name: string, did: string, 
            their_public_key: PublicKey, their_verify_key: VerifyKey,
            their_contact_public_key: PublicKey,
            digital_agent: string): Promise<Contact> {
        const check = this.getContactsArray().find(c => c.did === did);
        if (check)
            throw new Error('Contact already exists: ' + check.toString());
        const contact = await Contact.create(this.vault.pk, did, name,
            their_public_key, their_verify_key, their_contact_public_key,
            digital_agent);
        await this.saveContact(contact);
        return contact;
    }
    async contactRequest(contact: Contact): Promise<MessageDict> {
        console.log('[ContactsManager.contactRequest]')
        const requestee = {
            did: this.vault.did,
            name: this.vault.name,
            verify_key: this.vault.b58_verify_key,
            public_key: this.vault.b58_public_key,
            contact_public_key: contact.b58_public_key,
            // TODO: add digital agent
        };
        const message = new Message(
            Sender.fromVault(this.vault), Receiver.fromContact(contact),
            requestee, 'contact_request', '0.0.1', 'X25519Box', true
        )
        message.encryptBox(this.vault.private_key)
        contact.state = ContactState.REQUESTED;
        await this.saveContact(contact);
        // console.log(message.outboundFinal())
        // const signedPayload = this.vault.signPayload(payload);
        // contact.state = ContactState.REQUESTED;
        // if (DEBUG) {
        //     signedPayload['__DEBUG'] = payload;
        // }
        return message.outboundFinal();
    }
    async processInboundContactRequest(inbound: MessageDict): Promise<Contact> {
        // thros Invalid Singature on payload
        console.log('[ContactsManager.processInboundContactRequest]')
        if (inbound.type_name !== 'contact_request')
            throw new Error('Invalid data type');
        const message = Message.inbound(inbound);
        message.decrypt(this.vault.private_key);
        // TODO: did not decrypt... throw
        const requestee = message.decrypted;
        // if (requestee.did !== 'did:arx:' + requestee.verify_key)
        //     throw new Error('Invalid DID');
        const their_public_key = base58.decode(requestee.public_key);
        const their_verify_key = base58.decode(requestee.verify_key);
        const their_contact_public_key = base58.decode(requestee.contact_public_key);
        const contact = await Contact.create(this.vault.pk,
            requestee.did,
            requestee.name,
            their_public_key,
            their_verify_key,
            their_contact_public_key,
            '', // TODO: digital agent
            ContactState.INBOUND,
        );
        await this.saveContact(contact);
        return contact;
    }
    async acceptContactRequestResponse(contact: Contact): Promise<MessageDict> {
        console.log('[ContactsManager.acceptContactRequestResponse]')
        console.log(contact.toString())
        if(contact.state != ContactState.INBOUND)
            throw new Error('Invalid contact state: ' + contact.state);
        const message = new Message(
            Sender.fromVault(this.vault), Receiver.fromContact(contact),
            {
                did: this.vault.did,
                verify_key: this.vault.b58_verify_key,
                public_key: this.vault.b58_public_key,
                contact_public_key: contact.b58_public_key,
            },
            'accept_contact_request_response', '0.0.1', null, false
        )
        contact.state = ContactState.ACCEPTED;
        await this.saveContact(contact);
        return message.outboundFinal();
    }

    async processInboundAcceptContactRequestResponse(message: MessageDict): Promise<void> {
        console.log('[ContactsManager.processInboundAcceptContactRequestResponse]')
        if(message.type_name !== 'accept_contact_request_response')
            throw new Error('Invalid data type');
        const data = message.data;
        const contact = this.getContactByDid(data.did);
        if(contact.state == ContactState.ACCEPTED)
            // already accepted...
            return;
        if(contact.state != ContactState.REQUESTED)
            throw new Error('Invalid contact state: ' + contact.state);
        if(data.did !== 'did:arx:' + data.verify_key)
            throw new Error('Invalid DID');
        contact.state = ContactState.ACCEPTED;
        contact.their_public_key = base58.decode(data.public_key);
        contact.their_contact_public_key = base58.decode(data.contact_public_key);
        await this.saveContact(contact);
        return;
    }



}

export default ContactsManager;

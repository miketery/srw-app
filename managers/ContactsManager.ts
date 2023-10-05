import base58 from 'bs58';

import { PublicKey, VerifyKey } from '../lib/nacl';
import SS, { StoredType } from '../services/StorageService';

import Vault from '../models/Vault';
import Contact, { ContactState } from '../models/Contact';
import { Message, InboundMessageDict } from '../models/Message';

class ContactsManager {
    private _contacts: {string?: Contact};
    private _vault: Vault;

    constructor(vault: Vault, contacts: {string?: Contact} = {}) { 
        console.log('[ContactsManager.constructor] ' + vault.pk)
        this._contacts = contacts; 
        this._vault = vault;
    }
    clear() { this._contacts = {}; }
    async deleteContact(contact: Contact): Promise<void> {
        await SS.delete(contact.pk);
        delete this._contacts[contact.pk];
    }
    async saveContact(contact: Contact): Promise<void> {
        await SS.save(contact.pk, contact.toDict())
        this._contacts[contact.pk] = contact;
    }
    async loadContacts(): Promise<{string?: Contact}> {
        const contacts: {string?: Contact} = {};
        const contacts_data = await SS.getAll(StoredType.contact, this._vault.pk);
        for (let contact_data of Object.values(contacts_data)) {
            const c = Contact.fromDict(contact_data, this.vault);
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
            digital_agent: string, save=true): Promise<Contact> {
        /**
         * Add a contact to the vault, will send contact request
         */
        const check = this.getContactsArray().find(c => c.did === did);
        if (check)
            throw new Error('Contact already exists: ' + check.toString());
        const contact = await Contact.create(this.vault.pk, did, name,
            their_public_key, their_verify_key, their_contact_public_key,
            digital_agent, ContactState.INIT, this.vault);
        if(save)
            await this.saveContact(contact);
        // TODO send contact request!
        return contact;
    }
    async processContactRequest(inbound: InboundMessageDict): Promise<Contact> {
        /**
         * Inbound contact request (i.e. will end up with a INBOUND contact)
         * From there can accept or dismiss
         */
        console.log('[ContactsManager.processContactRequest]')
        if (inbound.type_name !== 'contact_request')
            throw new Error('108 Invalid data type');
        const message = Message.inbound(inbound);
        message.decrypt(this.vault.private_key);
        // TODO: did not decrypt... throw
        const requestee = message.getData();
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
            this.vault,
        );
        await this.saveContact(contact);
        return contact;
    }
    async acceptContactRequest(did: string, callback: () => void): Promise<void> {
        const contact = this.getContactByDid(did);
        if(contact.state != ContactState.INBOUND)
        // TODO: shouldn't guard here... FSM will takecare
            throw new Error('Invalid contact state: ' + contact.state);
        contact.fsm.send('ACCEPT', {callback});
    }
    async processAcceptContactRequestResponse(inbound: InboundMessageDict): Promise<void> {
        /**
         * Process accept contact request response 
         * (i.e. will end up with a ESTABLISHED contact)
         */
        console.log('[ContactsManager.processAcceptContactRequestResponse]',
            inbound.sender.name)
        if (inbound.type_name !== 'accept_contact_request_response')
            throw new Error('Invalid data type, required: "accept_contact_request_response"');
        const sender_did = inbound.sender.did;
        const contact = this.getContactByDid(sender_did);
        const message = Message.inbound(inbound);
        message.decrypt(contact.private_key);
        // TODO: did not decrypt... throw
        const data = message.getData();
        if(contact.state == ContactState.ESTABLISHED)
            // already accepted...
            return;
        if(contact.state != ContactState.PENDING)
            throw new Error('145 Invalid contact state: ' + contact.state);
        if(data.did !== 'did:arx:' + data.verify_key)
            throw new Error('Invalid DID');
        // contact.state = ContactState.ESTABLISHED;
        contact.their_public_key = base58.decode(data.public_key);
        contact.their_contact_public_key = base58.decode(data.contact_public_key);
        await this.saveContact(contact);
        return;
    }



}

export default ContactsManager;

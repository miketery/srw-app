// import base58 from 'bs58'

import Contact, { ContactState } from './Contact';
import SI, { StoredType } from './StorageInterface';

import Vault from './Vault';

class ContactsManager {
    // private static _instance: ContactsManager;
    private _contacts: {string?: Contact};
    private _vault: Vault | null;
    // singleton constructor
    constructor(vault: Vault) { 
        this._contacts = {}; 
        this._vault = vault;
    }
    // public static getInstance(): ContactsManager {
    //     if (!ContactsManager._instance) {
    //         ContactsManager._instance = new ContactsManager();
    //     }
    //     return ContactsManager._instance;
    // }
    clear() { this._contacts = {}; }
    // delete
    // save
    async load_contacts(): Promise<{string?: Contact}> {
        if(!this._vault)
            throw new Error('Vault not set');
        let contacts: {string?: Contact} = {};
        let contacts_data = await SI.getAll(StoredType.contact, this._vault.pk);
        for (let contact_data of Object.values(contacts_data)) {
            let c = Contact.from_dict(contact_data);
            contacts[c.pk] = c;
        }
        this._contacts = contacts;
        return contacts;
    }
    get_contacts(): {string?: Contact} {
        return this._contacts;
    }
    get_contacts_array(): Contact[] {
        return Object.values(this._contacts);
    }
    get_contact(pk: string, raise_exception = false): Contact|null {
        if(pk in this._contacts)
            return this._contacts[pk];
        if(raise_exception)
            throw new Error(`Secret not found: ${pk}`);
        return null;
    }
    get_contact_by_did(did: string, raise_exception = false): Contact|undefined {
        const contact = this.get_contacts_array().find(contact => contact.did === did);
        if (!contact && raise_exception) {
            throw new Error(`Contact not found: ${did}`);
        }
        return contact;
    }
    get_contact_by_name(name: string, raise_exception = false): Contact|undefined {
        const contact = this.get_contacts_array().find(contact => contact.name === name);
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
    get contacts_count(): number {
        return Object.keys(this._contacts).length;
    }
    get index(): string[] {
        return Object.keys(this._contacts);
    }
}

// const CM = ContactsManager.getInstance();
export default ContactsManager; // singleton
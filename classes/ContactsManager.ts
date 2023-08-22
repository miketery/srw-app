// import base58 from 'bs58'

import Contact, { ContactState } from './Contact';
import SI, { StoredType } from './StorageInterface';

import Vault from './Vault';

class ContactsManager {
    private static _instance: ContactsManager;
    private _contacts: Contact[];
    private _vault: Vault | null;
    // singleton constructor
    constructor() {
        this._contacts = [];
    }
    public static getInstance(): ContactsManager {
        if (!ContactsManager._instance) {
            ContactsManager._instance = new ContactsManager();
        }
        return ContactsManager._instance;
    }
    clear() {
        this._contacts = [];
    }
    init(vault: Vault) {
        console.log('[ContactsManager.init]')
        this._vault = vault;
        this.load_contacts();
    }
    async load_contacts(): Promise<Contact[]> {
        if(!this._vault)
            throw new Error('Vault not set');
        // load contacts from async storage
        let contacts: Contact[] = [];
        let contacts_data = await SI.getAll(StoredType.contact, this._vault.pk);
        for (let contact_data of Object.values(contacts_data)) {
            contacts.push(Contact.from_dict(contact_data));
        }
        this._contacts = contacts;
        return contacts;
    }
    get_contacts(): Contact[] {
        return this._contacts;
    }
    get_contact(did: string, raise_exception = false) {
        const contact = this._contacts.find(contact => contact.did === did);
        if (!contact && raise_exception) {
            throw new Error(`Contact not found: ${did}`);
        }
        return contact;
    }
    get_contact_by_name(name: string, raise_exception = false) {
        const contact = this._contacts.find(contact => contact.name === name);
        if (!contact && raise_exception) {
            throw new Error(`Contact not found: ${name}`);
        }
        return contact;
    }
}

const CM = ContactsManager.getInstance();
export default CM; // singleton
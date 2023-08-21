import base58 from 'bs58'

import Contact, { ContactState } from './Contact';
import SI, { StoredType } from './StorageInterface';


class ContactManager {
    private static instance: ContactManager;
    private contacts: Contact[];
    // singleton constructor
    constructor() {
        if (ContactManager.instance) {
            return ContactManager.instance;
        }
        this.contacts = [];
        ContactManager.instance = this;
    }
    clear() {
        this.contacts = [];
    }
    async load_contacts(vault_pk: string): Promise<Contact[]> {
        // load contacts from async storage
        let contacts: Contact[] = [];
        let contacts_data = await SI.getAll(StoredType.contact, vault_pk);
        for (let contact_data of Object.values(contacts_data)) {
            contacts.push(Contact.from_dict(contact_data));
        }
        this.contacts = contacts;
        return contacts;
    }
    get_contacts(): Contact[] {
        return this.contacts;
    }
    get_contact(did: string, raise_exception = false) {
        const contact = this.contacts.find(contact => contact.did === did);
        if (!contact && raise_exception) {
            throw new Error(`Contact not found: ${did}`);
        }
        return contact;
    }
    get_contact_by_name(name: string, raise_exception = false) {
        const contact = this.contacts.find(contact => contact.name === name);
        if (!contact && raise_exception) {
            throw new Error(`Contact not found: ${name}`);
        }
        return contact;
    }

}

const contact_manager = new ContactManager();
export default contact_manager; // singleton
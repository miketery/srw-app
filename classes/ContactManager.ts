import base58 from 'bs58'

import Contact from "./Contact";
import SI, { StoredTypes } from "./SI";


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
        let contacts_data = await SI.getAll(StoredTypes.contacts, vault_pk);
        for (let contact_data of Object.values(this.contacts)) {
            contacts.push(Contact.from_dict(contact_data));
        }
        this.contacts = contacts;
        return contacts;
    }
}

const contact_manager = new ContactManager();
export default contact_manager; // singleton


import { encode as b58encode, decode as b58decode } from 'bs58';
import * as jsonfile from 'jsonfile';
import * as nacl from 'tweetnacl';
import { verify_signed_payload } from './utils';
import { Message, MessageDict, Receiver, Sender } from './digital_agent_interface';
import { debug } from './config';
import { Contact, ContactState } from './Contact'; // Assuming you moved the Contact class to its own file

class ContactManager {
    contacts: Contact[] = [];
    vault: any;
    file_path: string;

    constructor(vault: any, file_path: string) {
        this.vault = vault;
        this.file_path = file_path;
        this.load_contacts();
    }

    load_contacts() {
        if (jsonfile.existsSync(this.file_path)) {
            const data = jsonfile.readFileSync(this.file_path);
            this.contacts = data.map((item: any) => Contact.from_dict(item));
        }
    }

    save_contacts() {
        jsonfile.writeFileSync(this.file_path, this.contacts.map(contact => contact.to_dict()), { spaces: 4 });
    }

    add_contact(did: string, name: string) {
        const contact = Contact.create_contact(did, name);
        this.contacts.push(contact);
        return contact;
    }

    get_contact(did: string, raise_exception = false) {
        const contact = this.contacts.find(contact => contact.did === did);
        if (!contact && raise_exception) {
            throw new Error(`Contact not found: ${did}`);
        }
        return contact;
    }

    // Remaining methods should be translated in a similar way...
}

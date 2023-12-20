import Vault from '../models/Vault';
import Contact, { ContactState } from '../models/Contact';
import ContactsManager from '../managers/ContactsManager';

import { test_vaults } from './testVaults.js';

import { encryptionKeyFromWords } from '../lib/utils';

const words = { // seed words so keys are constant for testing...
    'alice': {
        'bob': 'stereo address seven like end observe garage obvious pen post hospital bunker',
        'charlie': 'solid wedding silent grab used refuse blouse aim tape grape drastic weather',
        'dan': 'famous spirit hurdle nominee hat short opinion hamster erupt bomb soda frame',
    },
    'bob': {
        'alice': 'inner beauty setup air cream demise radar arrow game oppose call replace',
        'charlie': 'receive black rally tragic slight sand hero rapid veteran basic journey coral',
        'dan': 'token genius smooth foot globe body top marine useless float recipe furnace',
    },
    'charlie': {
        'alice': 'divorce bomb game rib furnace reduce nerve eagle winner smoke october problem',
        'bob': 'evolve stay spider noise bubble imitate adjust logic inside start object lend',
        'dan': 'push urge width next sail innocent able attack poem setup device purity',
    },
    'dan': {
        'alice': 'debate annual endless game gentle clerk intact rubber arrive armor ball empty',
        'bob': 'midnight ahead leave riot annual lounge rich cash vacant very forward adult',
        'charlie': 'critic novel soccer ball believe task nephew pudding ivory spider cactus price',
    }
}

const names = Object.keys(words)

const genVaults = () => Object.fromEntries(test_vaults.map((vault) => {
    return Vault.fromDict(vault)
}).map((vault) => [vault.name, vault]))

export async function getTestContacts(name: string, vaults?: {[name: string]: Vault}): Promise<{[pk: string]: Contact}> {
    let contacts = {}
    if(!vaults)
        vaults = genVaults()
    const vault = vaults[name]
    const their_names = Object.keys(words[name])
    for(let j = 0; j < their_names.length; j++) {
        const their_name = their_names[j]
        const my_words = words[name][their_name]
        const their_vault = vaults[their_name]
        const their_words = words[their_name][name]
        const theirContactKeyPair = encryptionKeyFromWords(their_words)
        const myContactKeyPair = encryptionKeyFromWords(my_words)
        const contact = await Contact.create(
            vault.pk, their_vault.did, their_name, their_vault.email,
            their_vault.public_key, their_vault.verify_key,
            theirContactKeyPair.publicKey, '', ContactState.ESTABLISHED, vault)
        contact.pk = 'c__' + their_name // for testing...
        contact.private_key = myContactKeyPair.secretKey
        contact.public_key = myContactKeyPair.publicKey
        contacts[contact.pk] = contact
    }
    return contacts
}


export async function getTestVaultsAndContacts() {
    const contacts = {}
    const vaults = genVaults()
    for(let i = 0; i < names.length; i++) {
        const name = names[i]
        contacts[name] = await getTestContacts(name, vaults)
    }
    return [vaults, contacts]
}

const dictByNameToByKey = (data: {[name: string]: any}): {[pk: string]: any} => {
    return Object.fromEntries(
        Object.keys(data).map((name) => [data[name].pk, data[name]])
    )
}
const dictByKeyToByName = (data: {[pk: string]: any}): {[name: string]: any} => {
    return Object.fromEntries(
        Object.keys(data).map((pk) => [data[pk].name, data[pk]])
    )
}

export async function getVaultsAndManagers(): Promise<{
        [name: string]: {
            vault: Vault,
            contactsManager: ContactsManager,
            contacts: {[nameOrPk: string]: Contact},
        }}> {
    const [vaults, contacts] = await getTestVaultsAndContacts()
    return Object.fromEntries(names.map(
        (name) => {
            return [
                name,
                {
                    vault: vaults[name] as Vault,
                    contactsManager: new ContactsManager(
                        vaults[name], contacts[name]),
                    contacts: Object.assign({}, // merge the two
                        contacts[name], // by name, 'bob' => Contact
                        dictByKeyToByName(contacts[name]), // by pk, 'c__[UUID]' => Contact
                    ),
                }
            ]
        })
    )
}

export default getVaultsAndManagers
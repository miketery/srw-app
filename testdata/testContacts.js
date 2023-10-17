import Contact, { ContactState } from '../models/Contact';
import Vault from '../models/Vault';
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

const partys = Object.keys(words)

const vaults = Object.fromEntries(test_vaults.map((vault) => {
    return Vault.fromDict(vault)
}).map((vault) => [vault.name, vault]))


async function getTestVaultsAndContacts() {
    const contacts = {}
    for(let i = 0; i < partys.length; i++) {
        const name = partys[i]
        const my_vault = vaults[name]
        const their_names = Object.keys(words[name])
        contacts[name] = {}
        for(let j = 0; j < their_names.length; j++) {
            const their_name = their_names[j]
            const my_words = words[name][their_name]
            const their_vault = vaults[their_name]
            const their_words = words[their_name][name]
            const theirContactKeyPair = encryptionKeyFromWords(their_words)
            const myContactKeyPair = encryptionKeyFromWords(my_words)
            const contact = await Contact.create(
                my_vault.pk, their_vault.did, their_name,
                their_vault.public_key, their_vault.verify_key,
                theirContactKeyPair.publicKey, '', ContactState.ESTABLISHED)
            contact.private_key = myContactKeyPair.secretKey
            contact.public_key = myContactKeyPair.publicKey
            contacts[name][their_name] = contact
        }
    }
    return [vaults, contacts]
}

export default getTestVaultsAndContacts
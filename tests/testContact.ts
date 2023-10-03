import { interpret } from 'xstate'
import ContactMachine from '../machines/ContactMachine';

import { test_vaults } from '../testdata/testVaults';
import Vault from '../models/Vault';
import ContactsManager from '../managers/ContactsManager';
import Contact from '../models/Contact';
// import { useMachine } from '@xstate/react';

const x = async () => {

    
    const alice_vault = Vault.fromDict(test_vaults[0])
    const bob_vault = Vault.fromDict(test_vaults[1])
    
    const alice_cm = new ContactsManager(alice_vault)
    const bob_contact = await alice_cm.addContact('Bob', bob_vault.did, 
    bob_vault.public_key, bob_vault.verify_key, Uint8Array.from([]), '')
    
    // start machine and set context
    const contactMachine = ContactMachine.withContext({
        contact: bob_contact,
        sender: (msg: any) => Promise.resolve(true),
    })
    const service = interpret(contactMachine)
    service.start() //'SENDING_INVITE')
    service.send('SUBMIT')
    console.log('state:', service.getSnapshot().value)
    setTimeout(() => {
        console.log('state:', service.getSnapshot().value)
    }, 500)
}
x()

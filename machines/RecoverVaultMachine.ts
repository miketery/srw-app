import { createMachine } from 'xstate';

import RecoverVault from '../models/RecoverCombine';
import { SenderFunction } from '../services/DigitalAgentService';

const RecoverVaultMachine = createMachine({
    id: 'recoverVaultFsm',
    initial: 'START',
    tsTypes: {} as import("./RecoverVaultMachine.typegen").Typegen0,
    context: {} as {
        recoverVault: RecoverVault,
        sender: SenderFunction,
    },
    schema: {
    },
    states: {
        START: {
            entry: ['save'],
            on: {
                LOAD_MANIFEST: 'MANIFEST_LOADED',
            },
        },
        MANIFEST_LOADED: {
            entry: ['save'],
            on: {
                SEND_REQUESTS: 'REQUESTING_SHARES',
            },
        },
        REQUESTING_SHARES: {


        },
        WAITING_ON_GUARDIANS: {

        },
        RECOVERING: {

        },
    }
}, {
    actions: {
        save: (context, event): void => {
            console.log('[FSM.RecoverVaultMachine.save]', context.recoverVault.toString())
            context.recoverVault.save()
        }
    },
    guards: {

    },
    services: {

    }
});

export default RecoverVaultMachine;
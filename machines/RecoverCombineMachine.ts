import { createMachine } from 'xstate';

import RecoverCombine from '../models/RecoverCombine';
import { SenderFunction } from '../services/DigitalAgentService';

const RecoverCombineMachine = createMachine({
    id: 'recoverVaultFsm',
    initial: 'START',
    tsTypes: {} as import("./RecoverCombineMachine.typegen").Typegen0,
    context: {} as {
        recoverCombine: RecoverCombine,
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
            entry: ['save', 'sendRequests'],
            on: {
                SENT: 'WAITING_ON_PARTICIPANTS',
            },
            always: [
                {target: 'WAITING_ON_PARTICIPANTS', cond: 'allRecoverCombineRequestsSent'}
            ]
        },
        WAITING_ON_PARTICIPANTS: {
            entry: ['save'],
        },
        RECOVERING: {
            entry: ['save'],
            invoke: {
                src: 'combineSharesAndDecrypt',
                id: 'combineSharesAndDecryptId',
                onDone: {
                    target: 'FINAL',
                },
                onError: {
                    target: 'ERROR_RECOVERING'
                }
            },
            on: {
                FINALIZE: 'FINAL',
            }
        },
        ERROR_RECOVERING: {
            entry: ['save'],
            on: {
                RECOVER: 'RECOVERING',
            }
        },
        FINAL: {
            entry: ['save'],
            type: 'final',                
        }
    }
}, {
    actions: {
        sendRequests: (context, event): void => {
            console.log('[FSM.RecoverCombineMachine.sendRequests]', context.recoverCombine.toString())
            for(let combineParty of context.recoverCombine.combinePartys) {
                combineParty.fsm.send('SEND_REQUEST', {callback: () => {
                    console.log('[FSM.RecoveryPlanMachine.sendRequests] callback', combineParty.name)
                }})
            }        
        },
        save: (context, event): void => {
            console.log('[FSM.RecoverCombineMachine.save]', context.recoverCombine.toString())
            context.recoverCombine.save()
        }
    },
    guards: {
        allRecoverCombineRequestsSent: (context, event): boolean => {
            return context.recoverCombine.allRecoverCombineRequestsSent()
        }
    },
    services: {

    }
});

export default RecoverCombineMachine;
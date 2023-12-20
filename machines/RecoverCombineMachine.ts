import { createMachine } from 'xstate';

import RecoverCombine from '../models/RecoverCombine';
import { SenderFunction } from '../services/DigitalAgentService';

const RecoverCombineMachine = createMachine({
    id: 'recoverCombineFsm',
    initial: 'START',
    tsTypes: {} as import("./RecoverCombineMachine.typegen").Typegen0,
    context: {} as {
        recoverCombine: RecoverCombine,
    },
    schema: {
        services: {} as {
            combineSharesAndDecrypt: {data: boolean},
        },
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
                SEND_REQUESTS: 'SENDING_REQUESTS',
            },
        },
        SENDING_REQUESTS: {
            entry: ['save', 'sendRequests'],
            on: {
                SENT: 'WAITING_ON_PARTICIPANTS',
            },
            always: [
                {target: 'WAITING_ON_PARTICIPANTS', cond: 'allRequestsSent'}
            ]
        },
        WAITING_ON_PARTICIPANTS: {
            entry: ['save'],
            always: [
                {target: 'RECOVERING', cond: 'recievedThreshold'}
                
            ]
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
                    target: 'ERROR_RECOVERING',
                    actions: ['recoveringError']
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
        save: (context, event): void => {
            console.log('[FSM.RecoverCombineMachine.save]', context.recoverCombine.toString())
            context.recoverCombine.save()
        },
        sendRequests: (context, event): void => {
            console.log('[FSM.RecoverCombineMachine.sendRequests]', context.recoverCombine.toString())
            for(let combineParty of context.recoverCombine.combinePartys) {
                combineParty.fsm.send('REQUEST', {callback: () => {
                    console.log('[FSM.RecoverCombineMachine.sendRequests] callback', combineParty.name)
                }})
            }        
        },
        recoveringError: (context, event): void => {
            console.log('[FSM.RecoverCombineMachine.recoveringError]', event)
            console.log(event.data.stack)
        }
    },
    guards: {
        allRequestsSent: (context, event): boolean => {
            return context.recoverCombine.allRequestsSent()
        },
        // allRequestsAccepted: (context, event): boolean => {
        //     return context.recoverCombine.allRequestsAccepted()
        // },
        recievedThreshold: (context, event): boolean => {
            return context.recoverCombine.recievedThreshold()
        }
    },
    services: {
        combineSharesAndDecrypt: async (context, event): Promise<boolean> => {
            console.log('[FSM.RecoverCombineMachine.combineSharesAndDecrypt]', context.recoverCombine.toString())
            context.recoverCombine.combine()
            return Promise.resolve(true)
        }
    }
});

export default RecoverCombineMachine;
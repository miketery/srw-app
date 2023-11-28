import { createMachine } from 'xstate';

import { CombineParty } from '../models/RecoverCombine';
import { SenderFunction } from '../services/DigitalAgentService';
import { combine } from 'secrets.js-grempe';

const CombinePartyMachine = createMachine({
    id: 'combinePartyFsm',
    initial: 'START',
    tsTypes: {} as import("./CombinePartyMachine.typegen").Typegen0,
    context: {} as {
        combineParty: CombineParty,
        sender: SenderFunction,
    },
    schema: {
        services: {} as {
            sendRequest: {data: boolean},
        }
    },
    states: {
        START: {
            entry: ['save'],
            on: {
                REQUEST: 'SENDING_REQUEST',
            },
        },
        SENDING_REQUEST: {
            invoke: {
                src: 'sendRequest',
                id: 'sendRequestId',
                onDone: {
                    target: 'PENDING',
                },
                onError: {
                    target: 'START',
                    actions: ['sendRequestError']
                }
            },
            on: {
                REDO: 'SENDING_REQUEST',
            },
        },
        PENDING: {
            entry: ['save', 'triggerParent'],
            on: {
                ACCEPT: 'ACCEPTED',
                DECLINE: 'DECLINED',
                RESEND_REQUEST: 'SENDING_REQUEST',
            },
        },
        ACCEPTED: {
            entry: ['save', 'triggerParent'],
            on: {
                FINALIZE: 'FINAL',
            },
        },
        DECLINED: {
            entry: ['save', 'triggerParent'],    
            on: {
                ACCEPT: 'ACCEPTED',
                RESEND_INVITE: 'SENDING_REQUEST',
            },
        },
        FINAL: {
            type: 'final',
        },
    }
}, {
    actions: {
        sendRequestError: (context, event): void => {
            console.log('[RecoveryPartyMachine.sendInviteError]', event)
            console.log(event.data.stack)
        },
        save: (context) => {
            context.combineParty.save();
        },
        triggerParent: (context, event): void => {
            console.log('[RecoveryPartyMachine.triggerParent]', event)
            context.combineParty.recoverCombine.fsm.send('')
        },
    },
    guards: {
    },
    services: {
        sendRequest: async (context, event): Promise<boolean> => {
            console.log('[RecoveryPartyMachine.sendInvite]', event)
            const msg = context.combineParty.recoverCombineRequestMsg()
            const res = await context.sender(msg)
            if(res) {
                // event.callback()
                return true
            }
            return false
        },
    }
});

export default CombinePartyMachine;


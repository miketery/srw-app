import { createMachine } from 'xstate';

import { SenderFunction } from '../services/DigitalAgentService';
import Guardian from '../models/Guardian';

const GuardianMachine = createMachine({
    id: 'guardianFsm',
    initial: 'INIT',
    tsTypes: {} as import("./GuardianMachine.typegen").Typegen0,
    context: {} as {
        guardian: Guardian, // TODO: guardian
        sender: SenderFunction,
    },
    schema: {
        services: {} as {
            sendResponse: {data: boolean},
        },
    },
    states: {
        INIT: { // Recived inbound request
            on: {
                ACCEPT: 'SENDING_ACCEPT',
                DECLINE: 'SENDING_DECLINE',
            },
        },
        SENDING_ACCEPT: {
            invoke: {
                src: 'sendResponse',
                id: 'sendResponseId',
                onDone: {
                    target: 'ACCEPTED',
                },
                onError: {
                    target: "INIT",
                    actions: ['sendResponseError']
                }
            }
        },
        SENDING_DECLINE: {
            invoke: {
                src: 'sendResponse',
                id: 'sendResponseId',
                onDone: {
                    target: 'DECLINED',
                },
                onError: {
                    target: "INIT",
                    actions: ['sendResponseError']
                }
            }
        },
        ACCEPTED: {
            entry: ['save'],
            on: {
                ARCHIVE: 'ARCHIVED',
            }
        },
        DECLINED: {
            entry: ['save'],
            on: {
                ACCEPT: 'SENDING_ACCEPT',
                ARCHIVE: 'ARCHIVED',
            },
        },
        ARCHIVED: {
            entry: ['save'],
            type: 'final',
        }
    }
}, {
    actions: {
        save: (context, event) => {
            context.guardian.save()
        },
        sendResponseError: (context, event) => {
            console.log('[GuardianMachine.sendResponseError]', event)
        },
    },
    services: {
        sendResponse: async (context, event: {type: string, callback: () => void}) => {
            console.log('[FSM.GuardianMachine.sendResponse]', event)
            const msg = context.guardian.responseMsg(event.type === 'ACCEPT' ? 'accept' : 'decline')
            const res = await context.sender(msg)
            if(res) {
                event.callback()
                return true
            }
            return false
        }
    }
})


export default GuardianMachine;
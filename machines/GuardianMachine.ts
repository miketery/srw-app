import { createMachine } from 'xstate';

import Contact from '../models/Contact';
import { SenderFunction } from '../services/DigitalAgentService';

const GuardianMachine = createMachine({
    id: 'guardianFsm',
    initial: 'INIT',
    tsTypes: {} as import("./GuardianMachine.typegen").Typegen0,
    context: {} as {
        guardian: Contact, // TODO: guardian
        contact: Contact,
        sender: SenderFunction,
    },
    schema: {
        services: {} as {
            sendResponse: {data: boolean},
        },
    },
    states: {
        INIT: {
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
})


export default GuardianMachine;
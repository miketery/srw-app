import { createMachine } from 'xstate';

import Contact from '../models/Contact';
import ContactsManager from '../managers/ContactsManager';
import DigitalAgentService from '../services/DigitalAgentService';
import Vault from '../models/Vault';
import { Message, OutboundMessageDict } from '../models/Message';

const ContactMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7ALgQ2ZgYrALYB0AkgHJkAqAxAMoCqAQgLI0DaADALqKgAHVLACWmERn4gAHogC0ATgAsJAMwAOAEwKAbJoCM+gOwn1AVgUAaEAE9E5-SSVcdSky66GuSgL4-raFi4BMTkVHSUzADyjBQAItx8SCBCouKSybIIcvpcXCT6mtom+kpueUrWdgj6CkYkLvo66s0t+maa6kZ+ARg4eISk9ACi8ZQA4gD6lABqNMO0EBhgJCLoAG6oANYrsGDoEGQbYmBkEIlSqWIS6FJZxvVGZqpmzjp6z5pKqlWIOsYNLi6IyqJRmIEafQ9ECBfohIajOITaYUObUBZgABOmNQmJIAgANthMAAzXGkPYHI7rE5nC7JK7pW6ZP5gkgOdRcdTqVSaVRGJRWWyIAWOLhmHRGL4KYy1CzQ2HBQZhaKxOK0ACCAGEtcMAArUemCYTXDKge5merqMp6AxcbQvTS-bLtRygx3aJSaDrqBV9JWhSIxeK0ABKwwAUsMtYbeJcTUy7ohnGYnB0moZBbUjPpnToFGpVKpxUZ88Yvto-UEBoGKKqQ8wADJRLUAaSNKQTNyTCCU7RIuh0vNUTRMUqdwpqnQHmhzemc2bK3X8MP9NYRYwoU21uoNi2Wqw2212+wgGuQyDAAkwdLjDK7Zpk9j5JB0ryUWnBxYUfOdOVUBaclwqiuEYMrNCOvgroq64kCMm7bjq+p0FiOJ4oSxJkpiFKnuel7XreSTGmk3Ysr29okBKZg8p+Shvv8f4OmoZSFMoTzgVWcLKnqiITJqSEGsMCR3sRprMuayYvAOLSCjyXqWrozojqoJBSjRmhvkYPIvGYnEBqQPEIbQ2AEgA7tgNiwB2jKkRJCB6PkWh0aWJh9tylSTmUKjqJmP4AUUWkvHpsHDPQ1Aak2ZD0AAEkJtBNi27YiZ2JGPlk-ximYuQWGBAGys6xiphKCi8s4IE8sBwXwiQoXhZFMVxRqoZatFZAzMM1kPuJT4IDK6iqSxJUKLoxhcEYSl6GotRaO8NHfFC0FrtVWoahQkzhvBcQomiCwbYi23zJ1qXdfcXIqbOvKdM8wFaOoeYKP1w2eDKX4+a8fgrugqAQHAUgwfC8bHT2OQfgURR1DmS4VH+Gj5B0Fg8u8TQOFVyqUDQgNicDLTspy+gtJoz0fnoSkGANRjATKI5fFoqOhJtyKzPMmOJmRrj5LO-zfF0FjtD8k7WjoTjvITRSvHy7R06QQZqiztk9XIpbSSVY1gkUdH5n+roDg5pSE9m6gKFLcG8Vukw7shctpYgI6OS4P5gXooIWFrlpqD+XTtNR4oKO9i3VtVhlIluVsnYg+MFs4Uritm3g+R51TaP1fYaToeTPMN7RQb0AfKrVEWNlFsVxKHPbUfU3g-soyjAXyOhKfoKm5A9fkKECMqaMb4ZRjGQml2R1GOE0s6Gy8VMfnm9Qa1K+MaaWLzLjnXGhAlbZ9-eQMD9aaZp4U7deiBBWzg0addLvfISnRxtNS1bXr6JrN2bkwEkEURZ9r7TRZXdk4af1+tSges8JG4pjYrTWnteIB10T9zsnoAsGhqKcm+K5cwzpeaqT5JXS0nJXgLT8EAA */
    id: 'contactFsm',
    initial: 'INIT',
    tsTypes: {} as import("./ContactMachine.typegen").Typegen0,
    schema: {
        services: {} as {
            sendInvite: {data: Boolean},
        },  
    },
    context: {} as {
        // contacts_manager: ContactsManager,
        contact: Contact,
        sender: (msg: OutboundMessageDict) => Promise<Boolean>,
    },
    states: {
        INIT: {
            on: {
                SUBMIT: "SENDING_INVITE",
                INBOUND: 'INBOUND',
            },
        },
 
        SENDING_INVITE: {
            invoke: {
                src: 'sendInvite',
                id: 'sendInviteId',
                onDone: {
                    target: 'PENDING',
                },
                onError: {
                    target: 'CAN_RESEND_INVITE',
                    actions: ['sendInviteError']
                },
            }
        },

        INBOUND: {
            on: {
                ACCEPT: 'SENDING_ACCEPT',
                REJECT: 'REJECTED',
                BLOCK: 'BLOCKED',
            },
        },

        SENDING_ACCEPT: {
            invoke: {
                src: 'sendAccept',
                id: 'sendAcceptId',
                onDone: {
                    target: 'ESTABLISHED',
                },
                onError: {
                    target: "INBOUND",
                    actions: ['sendAcceptError']
                }
            }
        },

        PENDING: {
            entry: ['save'],
            on: {
                ACCEPTED: 'ESTABLISHED',
                always: [
                    {
                        cond: 'isInviteExpired',
                        target: "CAN_RESEND_INVITE",
                    },
                ]
            },
            
        },

        ESTABLISHED: {
            entry: ['save'],
            on: {
                BLOCK: 'BLOCKED',
                ARCHIVE: 'ARCHIVED',
            },
        },

        REJECTED: {
            type: 'final',
        },

        BLOCKED: {
            type: 'final',
        },

        ARCHIVED: {
            type: 'final',
        },

        CAN_RESEND_INVITE: {
            on: {
                RESEND_INVITE: 'SENDING_INVITE',
            },
        }
    },
}, {
    actions: {
        sendInviteError: (context, event): void => {
            console.log('[sendInviteError]', event)
        },
        sendAcceptError: (context, event): void => {
            console.log('[sendAcceptError]', event)
        },
        save: (context, event): void => {
            console.log('FSM [ContactMachine.save]', context.contact.name, context.contact.state, event)
            context.contact.save()
        }
    },
    guards: {
        isInviteExpired: (context) => {
            return context.contact.isInviteExpired()
        },
    },
    services: {
        sendInvite: (context, event): Promise<Boolean> => {
            console.log('FSM [ContactMachine.sendInvite]', event)
            const msg = context.contact.inviteMsg()
            return context.sender(msg)
        },
        sendAccept: (context, event): Promise<Boolean> => {
            console.log('FSM [ContactMachine.sendAccept]', event)
            const msg = context.contact.acceptInviteMsg()
            return context.sender(msg)
        }
    }
});

export default ContactMachine;


        // sendInvite: (context, event): Promise<Boolean> => {
        //     const msg = context.contacts_manager.contactRequest(context.contact)
        //     const res = DigitalAgentService.postMessage(
        //         context.contacts_manager.vault, msg)
        //     if(!res)
        //         throw new Error('Failed to send invite')
        //     return res
        // },
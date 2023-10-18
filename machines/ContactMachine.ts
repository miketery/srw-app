import { createMachine } from 'xstate';

import Contact from '../models/Contact';
import { OutboundMessageDict } from '../models/Message';

const ContactMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7ALgQ2ZgYrALYB0AkgHJkAqAxAEoCiAigKqMDK1A2gAwC6iUAAdUsAJaZxGISAAeiAIyKAnCQBMAVnUA2XepUAOXpsUBmQwBoQAT0Q6A7Jo07NZxW8OHVZlQF8-azQsXAJicio6SgAhAHlWCgARPkEkEFEJKRk0hQQAWkVeXhJFdQMHB0UAFiqHIqrrOwRVBxJeHUUdQy7uj3VDBwCgjBw8QlIORiTKAHEAfUoANRpGWggMMBJxdAA3VABrTdgwdAgyXckwMggU2QzJaXRZXMUKkiczTSr2vTd1KrMjXsrzavBUjjMVU0YIsiiGIGCozCEymiVmCwoy2oqzAACdcahcSRhAAbbCYABmhNIx1O5x2l2utzS9yyTxy9ihJEMpmMXjM6jMDiqKiBCGFijamkc-xUr1Umn8gQRI1C4wicQSiVoAEEAMJ6xgABR4AjuYge2VAuX+6hI7mh7UMKhUiv66jFeRUxU+YOUOl8-ShSuGITG4Ri8SSDEYAClGHrTakRBa2c9ECLDPaimY9EYqooedUxaoSHpzN9wdpzDoqoZ4Yi1RGKJro9EADKxPUAaWZKcyj3TCALznBAcFnQqDjKJf6JBU6kqem+LRqg2VjfDKOmFHm+sNJrWGy2uwORxOEB1yGQYGEmCZZpZqcHHIQhkFZa+da0vDMYMFnrmGoxi-rWDhyl07hVA2qpbiQkw7nuBrGnQeIEkSpLklSuI0heV43neD7Jukz5WvISjQmWpQ8t6RSmFCnoGMU2hdLwhi1IuKgOGYMFhsiJBGqisy6shJqMMkj79pa7LWhmnzzt0maQlo4E6GK7hmO8-QWLomgOIYZifJovFIuqgmIbQ2AkgA7tgNiwH2JEDmRuR6MU75VI4jgSl4DS2BmNTcsoIqCgui4GcZG6wfxnDUDqHZkBwAAS4m0B2Xa9pJTnSUOHSSiYhSKuBvjyiWTgkNKKgCt8uYGb+JlNqQsXxe2iUpdqOr0HqSVkIsjCOayL6yQgcpZsKBZVS6HR1A46l6PaqjvjokHse4DVwXqOoUHMTAIYkGJYqsu2ogdKwDaRMnkc0bGaYuAr9G4v7vlY-kIDoRjzt6qgeE9HjQfC6CoBAcCyJuyLms5l25Hkf46CUXR1F4ryfN6amvTDbyI8t6jmDyHn-aGpnNjQEM5a+eRaFmnQDGx3jcYq7TqYuWkOLWVUaYu638Xt6JLCspNpq+tbFIuHQAgMioeICr3sXDnluWUXwTpFhONRqUaJALQ1XV6Y2QoUVRaNUHgeCWahFP0FTqAVRkmFz6o87ucz7ihWsuRm5VGDy04Au01taIB5UGLW8umOYBgqyqfFmUJu5u1DSjOiQ3yVMYgrTuCRhiob7maN70KVBYQr2+EzUJcl4nx0OeetLwIUqCKNWCmjTQaSUYLOqFYJyuoJekEw8aJpXT6Q7lH3tCbhYdIZAxle8mjQlC3R6YU07rqrcHpT2w9SYLw0WGoQqlAf06OKoLdKNx7y-nRdc1OCPFRdH4Sdd1vU79le9XcoRTJ04-x1zcE4Soc1ihQk+OndilRhR9xIJtbax0kinWxFXIWBh7R42MACCodZNBikllpP8Io9LGC+HCAIfggA */
    id: 'contactFsm',
    initial: 'INIT',
    tsTypes: {} as import("./ContactMachine.typegen").Typegen0,
    context: {} as {
        // contactsManager: ContactsManager,
        contact: Contact,
        sender: (msg: OutboundMessageDict) => Promise<boolean>,
    },
    schema: {
        services: {} as {
            sendInvite: {data: boolean},
        },  
    },
    states: {
        INIT: {
            on: {
                REQUEST: "SENDING_INVITE",
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
            console.log('[FSM.ContactMachine.sendInviteError]', event)
        },
        sendAcceptError: (context, event): void => {
            console.log('[FSM.ContactMachine.sendAcceptError]', event)
        },
        save: (context, event): void => {
            console.log('FSM.ContactMachine.save]', context.contact.name, context.contact.state, event)
            context.contact.save()
        }
    },
    guards: {
        isInviteExpired: (context) => {
            return context.contact.isInviteExpired()
        },
    },
    services: {
        sendInvite: async (context, event: {type: string, callback: () => void}): Promise<boolean> => {
            console.log('FSM [ContactMachine.sendInvite]', event)
            const msg = context.contact.inviteMsg()
            const res = await context.sender(msg)
            console.log('FSM [ContactMachine.sendInvite]', res)
            if(res) {
                event.callback()
                return true
            } // TODO: error callback?
            return false
        },
        sendAccept: async (context, event: {type: string, callback: ()=>void}): Promise<boolean> => {
            console.log('FSM [ContactMachine.sendAccept]', event)
            const msg = context.contact.acceptInviteMsg()
            const res = await context.sender(msg)
            console.log('FSM [ContactMachine.sendAccept]', res)
            if(res) {
                event.callback()
                return true
            } // TODO: error callback?
            return false
        }
    }
});

export default ContactMachine;


        // sendInvite: (context, event): Promise<boolean> => {
        //     const msg = context.contactsManager.contactRequest(context.contact)
        //     const res = DigitalAgentService.postMessage(
        //         context.contactsManager.vault, msg)
        //     if(!res)
        //         throw new Error('Failed to send invite')
        //     return res
        // },
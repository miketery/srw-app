import { createMachine } from 'xstate';

import Contact from './Contact';
import ContactsManager from './ContactsManager';
import DigitalAgentInterface from '../DigitalAgentInterface';
import Vault from '../Vault';
import { Message, OutboundMessageDict } from '../Message';

const ContactMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7ALgQ2ZgYrALYB0AkgHJkAqAxAMoCqAQgLI0DaADALqKgAHVLACWmERn4gAHogC0ATgAsJAMwAOAEwKAbJoCM+gOwn1AVgUAaEAE9E5-SSVcdSky66GuSgL4-raFi4BMTkVHSUzADyjBQAItx8SCBCouKSybIIckbqarkGZppmZqoKmuqq1nYImlxcJPpKqtpc6g46+t5+ARg4eISk9ACi8ZQA4gD6lABqNMO0EBhgJCLoAG6oANYrsGDoEGQbYmBkEIlSqWIS6FJZxkYkRqVmzjp6pZrN1Yidj-W6IyqJRmLgKDT6HogQL9EJDUZxCbTChzagLMAAJwxqAxJAEABtsJgAGY40h7A5HdYnM4XZJXdK3TK-EEkBzqNqVTSqIxKKy2RC8xxcMw6IxfBTGfQKCxQmHBQZhaKxOK0ACCAGENcMAArUOmCYTXDKge5mR7qJRKPQGLjaVRFH7ZfRmRzAh2abRKYoVOV9BWhSIxeK0ABKwwAUsMNfreJcjYy7ohnGYnEV9J0mpKFEZ9E6dAo1KpVCKjAXjF9tH6ggNAxRlSHmAAZKIagDSBpSCZuSYQShdJF0OhaqgzJnFmid+gqg80ub0zmlvLc1dhipGYwoU012r1i2Wqw2212+wgauQyDAAkwtLj9O7Jpk9m5JB0ryUWlBJfKVQFzrKbL1KorhGJKOiVE0q4BvCm7blqup0Ji2K4gSRKkhi5Knuel7XreSSGmkPbMn2dokKKZiVJ+1qinmf5yPaahWtOyjPGBUG1qQOoIhM6rwXqwwJHeBHGkyprJg6g7qK4CiVN65q6E6o6qE8FQaJob65MWJTsXCJBcbBtDYPiADu2A2LAnYMkRYkIHoDRaNaZYmP27RKE6VoqOohh8ty5RzpUZg6Yqwz0NQarNmQ9AABICbQzath2QldoRj5ZJmJAil0FigWUUpTs8ZEFi0zjAZUXCqEFoQhWFEXRbFaqhhqUVkDMwyWQ+olPggkp5Mu0plLoxhcEYil6Go0paO8lHNJC-jQv6HEkBqaoUJM4YbnEyKogs60Ilt8ztSlnX3G0ylzi0FSlOVWjqPmMmDgoniSl+XmvH4c3oKgEBwFI8ocfGR29nITSaGoWi6AYDy5DoTpyBoDRFBYUm8rypTqJVpCUDQAMiUDb5PCBw25jJ5hAop2hFsBoqjtOriBXNf26RtSKzPMOOJsRrgNHOnTNOorEur+NSWjoTjvHUnqvNyLoY0qwZxOz1ldTkosyeCw0gp61oFrDLqOBDnjek9uQKLLzNbpMO4IYrqWIKO9kuOUoF6MCFi6+aajlPzLoUSKMq+AzC26fpiJbjbx2IPo6iFs44qZTm3heW5f7aHk-bqTo9SlAoz0B70Na6dV4VNpFMUK-egPERR-w+coyjldyMN-kpjRgtHvlgpKmiy+GUYxgJ4e9hRjgZv54IWPowK3X+Ypi2KBiTWWDpGLL8XtgPFe41Xlpppn06d96wFTnOGWZ-ze-cqK1qyw1TUtRvwkczZXTlSQnrFv2MoZq6081OpeR1ArDJUo7wsqy2WqtXa8R9pokHpzCmGgKIcmaM5cwToJ4qRLHyc0HJXizT8EAA */
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
        },
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
        //     const res = DigitalAgentInterface.postMessage(
        //         context.contacts_manager.vault, msg)
        //     if(!res)
        //         throw new Error('Failed to send invite')
        //     return res
        // },
import { createMachine } from 'xstate';

import { RecoveryParty } from '../models/RecoveryPlan';
import { SenderFunction } from '../services/DigitalAgentService';

const RecoveryPartyMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCcwGMD2A3MyCeACgIbIAueAdAJIByVAKgMQDKAojQCID6tAag6wDaABgC6iUAAcMsAJalZGAHYSQAD0QBGAGyaKAZgBMAdkMBWfQBYAnPuuXt2gDQg8W62YrDNw68f3alpY+lmYAHAC+ES6omDj4xGSUbJy0AOI8NPz0rCzs9CLiSCDScgrKqhoINsYUmpbG4Wb11sLeLm4Imh5ePn4BQSHhUTHo2LiEJOQUBOwc6YwAggDCy6wEBWKqpfKKKsVVpsJehvrChoHGlhdmzq6Iht4U12ZmDWdhwpZhmoYjILFxgkppRZqkaGlGAAlVgAKVYy02RSkMl2FQOiCOJzOFwa120tw6iB+Bja+n0xjCjWsjm6-0B8UmSQoKzWG1YHEYADFaIsADJUABaQi2xR25X2oCqvyMFGM1jC2hMxk05N8YSJXXsdWMxgJ2hp5LMwjClnpY0ZiWmMPhiI5S1W6yR21REsqiD8lme-k9hm+j30mpJZ2E5Mp1Np1ii0RASgwEDgqgZEytnRRZT27oQAFo7p1c+a4imQdQ6PQXRn0VLENdNd0vWFrH6wmY-CqqaFC0CmdMUvMIZlsqwK2jJepEPpuhRXo8wvowo3bIZDHXtY2-UqTZZ9K9FV3LSWwf20iO3RiEK2wnKLDZro2F3ZVw2mw5Z9vd9p98XmaynRzT5m559LUFg6E21geMIuiaE+Xitt0Fi6FYvhfsCzI2giOQcABVbjggpr6F4nxXGYy6aDKxhBnomg-FSSo+rcRioT2lA8jQ-I4WO0oBMcthBHqernAhq6GBQPyqroYSGJoZiUpE0ZAA */
    id: 'recoveryPartyFsm',
    initial: 'INIT',
    tsTypes: {} as import("./RecoveryPartyMachine.typegen").Typegen0,
    context: {} as {
        recoveryParty: RecoveryParty,
        sender: SenderFunction,
    },
    schema: {
        services: {} as {
            sendInvite: {data: boolean},
        }
    },
    states: {
        INIT: {
            on: {
                SEND_INVITE: 'SENDING_INVITE',
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
                    target: 'INIT',
                    actions: ['sendInviteError']
                },
            }
        },
        PENDING: {
            entry: ['save', 'recoveryPlanTrigger'],
            on: {
                ACCEPT: 'ACCEPTED',
                DECLINE: 'DECLINED',
                RESEND_INVITE: 'SENDING_INVITE',
            },
        },
        ACCEPTED: {
            entry: ['save', 'recoveryPlanTrigger'],
            on: {
                FINALIZE: 'FINAL',
            },
        },
        DECLINED: {
            entry: ['save', 'recoveryPlanTrigger'],
            on: {
                ACCEPT: 'ACCEPTED',
                RESEND_INVITE: 'SENDING_INVITE',
            },
        },
        FINAL: {
            type: 'final',
        },
    }
}, {
    actions: {
        sendInviteError: (context, event): void => {
            console.log('[RecoveryPartyMachine.sendInviteError]', event)
            console.log(event.data.stack)
        },
        save: (context, event): void => {
            console.log('[RecoveryPartyMachine.save]', event)
            // context.recoveryParty.save()
        },
        recoveryPlanTrigger: (context, event): void => {
            console.log('[RecoveryPartyMachine.recoveryPlanTrigger]', event)
            context.recoveryParty.recoveryPlan.fsm.send('')
        },
    },
    guards :{},
    services: {
        sendInvite: async (context, event: {callback: () => void}): Promise<boolean> => {
            console.log('[RecoveryPartyMachine.sendInvite]', event)
            const msg = context.recoveryParty.inviteMessage()
            const res = await context.sender(msg)
            if(res) {
                event.callback()
                return true
            }
            return false
        }
    }
});

export default RecoveryPartyMachine;
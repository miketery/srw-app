import { createMachine } from 'xstate';

import RecoveryPlan from '../models/RecoveryPlan';
import { OutboundMessageDict } from '../models/Message';

const RecoveryPlanMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCcwGMD2A3MyCeAsgIYB2AlgGZwAuAdACIBKAggGIAqAxAMoCiAcvQD6ASX4A1Ee17cA2gAYAuolAAHDLDLUyGEipAAPRAEZjtAJwA2ACwAOawCYArJYDsD8-PkOANCDwm1vK0TuZOXmFetvKhAMwAvvF+qJg4+MTkVLB0AOrMUmIA4kIA8vxCAArMjOwiAMIiVfzs3JxEADbtzGhoYKrUkArKSCDqmtq6+kYIALSWTrTGMdbuVq5OK67GfgEIsfK2tLZhoY4O8tbW5raJyejYuISklDS0eQX8xWWV1bUNTS1OBQMMheowwEQIHghvoxlodHoRtMHJZLLRrLFLsYnMZPA5jJZfP5EPtDscnKcHOdLuZzLcQCkHulnlk6IxeMx6ABNThodoQkgAVVUMJGcImiNA01iCwctmMDiurhlGKpth2iEu1iOjhWtipBM8F3pjLST0yr1YYmYABk2qCABZkHCitQaeGTJEkw7WJyueSxUxLOyo9XEhCWAO0FHrLa0-FODyJJIgEgYCBwfSmx4ZF7ZWHuiVTRAzUyxRbLVZuDauLYahDBcwE1FyyxLWxuJuuE33M251kMFgcAvjBHFhCOeu2H3Nwkd9udnupHMs17vWqfUrlKo1eqNZjNbgjj2Swwk1y0WtlpYbayz+sOWKHYzuQNLcyOXGxbsp7PMi3ZLQ7Kclyx5Fl6E5mNE1iWLYrhXI+8ieK49bfuWlgnMYvq2DKcrWEuTLmnmdBWvwtpgWOEG+rQsQfk4gZPrEoZUvWiZmDEVgorh8gEgkv69iuAF0NUdQABIiOIvD0BRnpSogcqLLEcqmGEtGXBs9awYclhqbB1y+khP6JEAA */
    id: 'recoveryPlanFsm',
    initial: 'DRAFT',
    tsTypes: {} as import("./RecoveryPlanMachine.typegen").Typegen0,
    context: {} as {
        recoveryPlan: RecoveryPlan,
        sender: (msg: OutboundMessageDict) => Promise<boolean>,
    },
    schema: {
        services: {} as {
            splitKey: {data: boolean},
        },  
    },
    states: {
        DRAFT: {
            on: {
                SPLIT_KEY: 'SPLITTING_KEY',
            },
        },
        SPLITTING_KEY: {
            invoke: {
                src: 'splitKey',
                id: 'splitKeyId',
                onDone: {
                    target: 'READY_TO_SEND_INVITES',
                },
                onError: {
                    target: 'DRAFT',
                }
            }
        },
        READY_TO_SEND_INVITES: {
            on: {
                SEND_INVITES: {
                    target: 'SENDING_INVITES'
                }
            }
        },
        SENDING_INVITES: {
            entry: ['sendInvites'],
            on: {
                SENT: {
                    target: 'WAITING_ON_PARTICIPANTS'
                },
            }
        },
        WAITING_ON_PARTICIPANTS: {
            on: {
                allAccepted: {
                    target: 'READY',
                    cond: "allRecoveryPartysAccepted"
                },
                // forceReady: {
                //     target: 'READY',
                //     cond: "minRecoveryPartysAccepted"
                // },
            }
        },
        READY: {
            on: {
                cleanUp: "FINAL"
            }
        },
        FINAL: {
            on: {
                archive: "ARCHIVED"
            }
        },
        ARCHIVED: {}
    }
}, {
    actions: {
        sendInvites: (context, event): void => {
            console.log('[FSM.RecoveryPlanMachine.sendInvites]', context.recoveryPlan.name, event)
            for(let recoveryParty of context.recoveryPlan.recoveryPartys) {
                recoveryParty.fsm.send('SEND_INVITE', {callback: () => {
                    console.log('[FSM.RecoveryPlanMachine.sendInvites] callback', recoveryParty.name)
                }})
            }
        }
    },
    guards: {
        allRecoveryPartysAccepted: (context, event) => {
            console.log('[GAURD] allRecoveryPartysAccepted');
            console.log(event)
            console.log(context)
            return false;
        }
    },
    services: {
        splitKey: async (context: {recoveryPlan: RecoveryPlan}, event) => {
            console.log('[FSM.RecoverPlanMachine.splitKey]', event)
            await context.recoveryPlan.generateKey()
            await context.recoveryPlan.splitKey()
            return Promise.resolve(true)
        }
    }
});

export default RecoveryPlanMachine;
// RecoveryManisfest
// - DRAFT (details)
// - ADD PARTICIPANTS
// - WAITING ON PARTICIPANTS
//      RecoveryParty
//      - INIT (send share)
//      - PENDING
//      - ACCEPTED
//      - REJECTED
//      - PLACEHOLDER
// - READY
//      Invites
// - RESET
// INVITES ACCEPTED


// const promiseService = interpret(promiseMachine).onTransition((state) =>
//   console.log(state.value)
// );

// // Start the service
// promiseService.start();
// // => 'pending'

// promiseService.send({ type: 'RESOLVE' });

// const Component = () => {
//     const [state, send, service] = useMachine(promiseMachine);
  
//     return (
//         <div>
//             {/** You can listen to what state the service is in */}
//             {state.matches('pending') && <p>Loading...</p>}
//             {state.matches('rejected') && <p>Promise Rejected</p>}
//             {state.matches('resolved') && <p>Promise Resolved</p>}
//             <div>
//                 {/** You can send events to the running service */}
//                 <button onClick={() => send('RESOLVE')}>Resolve</button>
//                 <button onClick={() => send('REJECT')}>Reject</button>
//             </div>
//         </div>
//     );
// };
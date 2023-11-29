import { createMachine } from 'xstate';

import RecoverSplit from '../models/RecoverSplit';

const RecoverSplitMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCcwGMD2A3MyCeAsgIYB2AlgGZwAuAdACIBKAggGIAqAxAMoCiAcvQD6ASX4A1Ee17cA2gAYAuolAAHDLDLUyGEipAAPRAEZjtAJwA2ACwAOawCYArJYDsD8-PkOANCDwm1vK0TuZOXmFetvKhAMwAvvF+qJg4+MTkVLB0AOrMUmIA4kIA8vxCAArMjOwiAMIiVfzs3JxEADbtzGhoYKrUkArKSCDqmtq6+kYIALSWTrTGMdbuVq5OK67GfgEIsfK2tLZhoY4O8tbW5raJyejYuISklDS0eQX8xWWV1bUNTS1OBQMMheowwEQIHghvoxlodHoRtMHJZLLRrLFLsYnMZPA5jJZfP5EPtDscnKcHOdLuZzLcQCkHulnlk6IxeMx6ABNThodoQkgAVVUMJGcImiNA01iCwctmMDiurhlGKpth2iEu1iOjhWtipBM8F3pjLST0yr1YYmYABk2qCABZkHCitQaeGTJEkw7WJyueSxUxLOyo9XEhCWAO0FHrLa0-FODyJJIgEgYCBwfSmx4ZF7ZWHuiVTRAzUyxRbLVZuDauLYahDBcwE1FyyxLWxuJuuE33M251kMFgcAvjBHFhCOeu2H3Nwkd9udnupHMs17vWqfUrlKo1eqNZjNbgjj2Swwk1y0WtlpYbayz+sOWKHYzuQNLcyOXGxbsp7PMi3ZLQ7Kclyx5Fl6E5mNE1iWLYrhXI+8ieK49bfuWlgnMYvq2DKcrWEuTLmnmdBWvwtpgWOEG+rQsQfk4gZPrEoZUvWiZmDEVgorh8gEgkv69iuAF0NUdQABIiOIvD0BRnpSogcqLLEcqmGEtGXBs9awYclhqbB1y+khP6JEAA */
    id: 'recoverSplitFsm',
    initial: 'START',
    tsTypes: {} as import("./RecoverSplitMachine.typegen").Typegen0,
    context: {} as {
        recoverSplit: RecoverSplit,
    },
    schema: {
        services: {} as {
            splitKey: {data: boolean},
        },  
    },
    states: {
        START: {
            entry: ['save'],
            on: {
                SPLIT_KEY: 'SPLITTING_KEY',
            },
        },
        SPLITTING_KEY: {
            entry: ['save'],
            invoke: {
                src: 'splitKey',
                id: 'splitKeyId',
                onDone: {
                    target: 'READY_TO_SEND_INVITES',
                },
                onError: {
                    target: 'START',
                }
            }
        },
        READY_TO_SEND_INVITES: {
            entry: ['save'],
            on: {
                SEND_INVITES: {
                    target: 'SENDING_INVITES'
                }
            }
        },
        SENDING_INVITES: {
            entry: ['save', 'sendInvites'],
            on: {
                SENT: {
                    target: 'WAITING_ON_PARTICIPANTS'
                },
            },
            always: [
                { target: 'WAITING_ON_PARTICIPANTS', cond: 'allInvitesSent'}
            ]
        },
        WAITING_ON_PARTICIPANTS: {
            entry: ['save'],
            on: {
                forceReady: {
                    target: 'READY',
                    // cond: "minRecoverSplitPartysAccepted"
                },
            },
            always: [
                { target: 'READY', cond: 'allRecoverSplitPartysAccepted'}
            ]
        },
        READY: {
            on: {
                FINALIZE: "FINAL"
            }
        },
        FINAL: {
            on: {
                ARCHIVE: "ARCHIVED"
            }
        },
        ARCHIVED: {
            on: {
                RESTORE: 'FINAL'
            }
        }
    }
}, {
    actions: {
        sendInvites: (context, event): void => {
            console.log('[FSM.RecoverSplitMachine.sendInvites]', context.recoverSplit.name, event)
            for(let recoverSplitParty of context.recoverSplit.recoverSplitPartys) {
                recoverSplitParty.fsm.send('SEND_INVITE', {callback: () => {
                    console.log('[FSM.RecoverSplitMachine.sendInvites] callback', recoverSplitParty.name)
                }})
            }
        },
        save: (context, event): void => {
            console.log('[FSM.RecoverSplitMachine.save]', context.recoverSplit.name, context.recoverSplit.state, event)
            context.recoverSplit.save()
        }
    },
    guards: {
        allRecoverSplitPartysAccepted: (context, event) => {
            console.log('[FSM.RecoverSplitMachine.allRecoverSplitPartysAccepted] Guard', context.recoverSplit.name, event);
            return context.recoverSplit.allPartysAccepted();
        },
        allInvitesSent: (context, event) => {
            console.log('[FSM.RecoverSplitMachine.allRecoverSplitPartysSent] Guard', context.recoverSplit.name, event);
            return context.recoverSplit.allInvitesSent();
        }
    },
    services: {
        splitKey: async (context: {recoverSplit: RecoverSplit}, event) => {
            console.log('[FSM.RecoverPlanMachine.splitKey]', event)
            await context.recoverSplit.generateKey()
            context.recoverSplit.encryptPayload()
            await context.recoverSplit.splitKey()
            return Promise.resolve(true)
        }
    }
});

export default RecoverSplitMachine;
// RecoveryManisfest
// - DRAFT (details)
// - ADD PARTICIPANTS
// - WAITING ON PARTICIPANTS
//      RecoverSplitParty
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
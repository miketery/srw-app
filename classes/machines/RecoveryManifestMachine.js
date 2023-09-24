import { createMachine } from 'xstate';

const RecoveryManisfestMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QCcwGMD2A3MyCeAsgIYB2AlgGZwAuAdACIBKAggGIAqAxAMoCiAcvQD6ASX4A1Ee17cA2gAYAuolAAHDLDLUyGEipAAPRAEZjtAJwA2ACwAOawCYArJYDsD8-PkOANCDwm1vK0TuZOXmFetvKhAMwAvvF+qJg4+MTkVLB0AOrMUmIA4kIA8vxCAArMjOwiAMIiVfzs3JxEADbtzGhoYKrUkArKSCDqmtq6+kYIALSWTrTGMdbuVq5OK67GfgEIsfK2tLZhoY4O8tbW5raJyejYuISklDS0eQX8xWWV1bUNTS1OBQMMheowwEQIHghvoxlodHoRtMHJZLLRrLFLsYnMZPA5jJZfP5EPtDscnKcHOdLuZzLcQCkHulnlk6IxeMx6ABNThodoQkgAVVUMJGcImiNA01iCwctmMDiurhlGKpth2iEu1iOjhWtipBM8F3pjLST0yr1YYmYABk2qCABZkHCitQaeGTJEkw7WJyueSxUxLOyo9XEhCWAO0FHrLa0-FODyJJIgEgYCBwfSmx4ZF7ZWHuiVTRAzUyxRbLVZuDauLYahDBcwE1FyyxLWxuJuuE33M251kMFgcAvjBHFhCOeu2H3Nwkd9udnupHMs17vWqfUrlKo1eqNZjNbgjj2Swwk1y0WtlpYbayz+sOWKHYzuQNLcyOXGxbsp7PMi3ZLQ7Kclyx5Fl6E5mNE1iWLYrhXI+8ieK49bfuWlgnMYvq2DKcrWEuTLmnmdBWvwtpgWOEG+rQsQfk4gZPrEoZUvWiZmDEVgorh8gEgkv69iuAF0NUdQABIiOIvD0BRnpSogcqLLEcqmGEtGXBs9awYclhqbB1y+khP6JEAA */
    id: 'recoveryManifest',
    initial: 'DRAFT',
    context: {a: 'a value'},
    states: {
        DRAFT: {
            on: {
                SEND_INVITES: 'WAITING_ON_PARTICIPANTS',
                // ADD_PARTICIPANTS: 'DRAFT',
                // DELETE_PARTICIPANTS: 'DRAFT',
            },
        },
        WAITING_ON_PARTICIPANTS: {
            on: {
                allAccepted: {
                    target: 'READY',
                    cond: "allParticipantsAccepted"
                },
                forceReady: {
                    target: 'READY',
                    cond: "minParticipantsAccepted"
                },
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
    guards: {
        allParticipantsAccepted: (context, event) => {
            console.log('[GAURD] allParticipantsAccepted');
            console.log(event)
            console.log(context)
            return true;
        }
    }
});

export default RecoveryManisfestMachine;
// RecoveryManisfest
// - DRAFT (details)
// - ADD PARTICIPANTS
// - WAITING ON PARTICIPANTS
//      Participant
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
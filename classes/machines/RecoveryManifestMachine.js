import { createMachine, interpret } from 'xstate';
import { useMachine } from '@xstate/react';

const RecoveryManisfestMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AtgS1mAdACIBKAggGIAqAxAMoCiAcoQPoCSjAam5fbQNoAGALqIU6WNgAu2dADsxIAB6IAtACYAzPgCsATk0BGTQDYdAFn0B2ABx716gDQgAnmvU78Wk3ps3zNvompoEAvqHOaFi4BCQUNKSErAAKpMSUbADCbKmMlAIiisgS0rIKSMqI6oYm+FZaeiYmNiZWmoHmzm4Iqtrm1TZWOsbmVubmesPhkRg4eERkVNSE9AAy9LwsqelZOaR5BaIVxZIy8ooqCIa2dWbB6oKaBqNdajbahsOC43rmgr-+GzTEBROYEADqpB4HAA4iwAPKMLZpDLZXL5agAQwANtjSABjfFgZBSSBCI7iU5lC5qQyCQT4JqaSwmSx6dnmExOVyIGp6fA2QT+HSsqy2QyGdTA0ExfCQ6GMOGI5E7NH7DEAM3QqCJxDAmIgLnJRRKZ3KoEu6ia+E0bXGrT0Qx0zteVx8AqFLNG4olQIiINmsuI9ESAE1qPjsfq5ABVZDG46m6kVS6qBnqKytTRGQQ6eo6QSszo8hDtQz4cy2pp+QXtWzSwPzcgcUirLE6gAW2AAbmAE5TSucU4gGTp1H8xxYHCKdMzDK6Z7dBMZHo1xxNwv65OgIHAio2wCaqUOLbSAozgl79Byua7VIY-Lp1C0gvZZ4IPA3ovM4lQj4PzUqBBanGB5PmXUZHjGPQ7zpcsPxfGxjCsX0tC-ME5ShDJFQRJFtlRPYDn-M0aR6TwPD0Qx+hMIUrEafpi26fQvHfPN6UEFCniadCgxDQhQ2I5NT2ArxOSsT0UIsSt2ldDNzHwb53m+Lj1EowweKbFtVkEk8gP5d4zE5Z12QlLRGMQAttCtZctE0f5xXMDSCDSTIAAk2E4ehCB0wDUysCsPBqAIC3pB53h0V0uU8TNZzrVTbGZTdQiAA */
    id: 'promise',
    initial: 'DRAFT',
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
});

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


const promiseService = interpret(promiseMachine).onTransition((state) =>
  console.log(state.value)
);

// Start the service
promiseService.start();
// => 'pending'

promiseService.send({ type: 'RESOLVE' });

const Component = () => {
    const [state, send, service] = useMachine(promiseMachine);
  
    return (
        <div>
            {/** You can listen to what state the service is in */}
            {state.matches('pending') && <p>Loading...</p>}
            {state.matches('rejected') && <p>Promise Rejected</p>}
            {state.matches('resolved') && <p>Promise Resolved</p>}
            <div>
                {/** You can send events to the running service */}
                <button onClick={() => send('RESOLVE')}>Resolve</button>
                <button onClick={() => send('REJECT')}>Reject</button>
            </div>
        </div>
    );
};
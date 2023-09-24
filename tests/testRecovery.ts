import { interpret } from 'xstate'
import RecoveryManifestMachine from '../classes/machines/RecoveryManifestMachine';


const recoveryService = interpret(RecoveryManifestMachine);

recoveryService.onTransition((state) => {
  console.log("Current state:", state.value);
});
console.log('1')
recoveryService.start();
console.log('2')
recoveryService.send("SEND_INVITES");
const snapshot = recoveryService.getSnapshot();
console.log('value ', snapshot.value);
console.log('context ', snapshot.context);
// Simulate actions
// recoveryService.send("DONE_SPLITTING");
// recoveryService.send("SENT");

const restoredState = RecoveryManifestMachine.transition(snapshot.value, { type: 'DUMMY' });

// Start your service with the restored state
const recoveryServiceB = interpret(RecoveryManifestMachine).start(restoredState);

recoveryServiceB.onTransition((state) => {
  console.log("Current state:", state.value);
});
recoveryService.start();

recoveryServiceB.send("allAccepted");
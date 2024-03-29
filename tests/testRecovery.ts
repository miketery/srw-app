import { interpret } from 'xstate'
import RecoverSplitMachine from '../machines/RecoverSplitMachine';


const recoveryService = interpret(RecoverSplitMachine);

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

const restoredState = RecoverSplitMachine.transition(snapshot.value, { type: 'DUMMY' });

// Start your service with the restored state
const recoveryServiceB = interpret(RecoverSplitMachine).start(restoredState);

recoveryServiceB.onTransition((state) => {
  console.log("Current state:", state.value);
});
recoveryService.start();

recoveryServiceB.send("allAccepted");
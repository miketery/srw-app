import { MasterPassword } from './vault.js';
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

var a = new MasterPassword();

sleep(3000);
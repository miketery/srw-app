const { exit } = require('process');
var nacl = require("tweetnacl");
// nacl.util = require("tweetnacl-util");
var bip39 = require("bip39");

function bytesTohex(byteArray) {
  return Array.from(byteArray, (byte) => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2)
  }).join('');
}
function hexToBytes(hexString) {
  return Buffer.from(hexString, 'hex');
}


var tmp = bip39.generateMnemonic();
console.log(tmp);

var entropy = '1a0d9d97ee373fea8a704bd9ee4b52200fafdf28ea38cdbae4d5d8aada200e10'
var mnemonic = bip39.entropyToMnemonic(entropy);
var seed = bip39.mnemonicToSeedSync(mnemonic);
console.log(bytesTohex(seed.slice(0,32)));

var keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
console.log(bytesTohex(keypair.secretKey));

// exit();
// var forge = require('node-forge');

// console.log(seed_hex);
// var seed = forge.util.hexToBytes(seed_hex).slice(0,32);
// console.log(forge.util.bytesToHex(seed));

// var ed25519 = forge.pki.ed25519;

// // generate a random ED25519 keypair
// var keypair = ed25519.generateKeyPair();
// // `keypair.publicKey` is a node.js Buffer or Uint8Array
// // `keypair.privateKey` is a node.js Buffer or Uint8Array
// console.log(forge.util.bytesToHex(keypair.privateKey), typeof(keypair.privateKey));
// // generate a random ED25519 keypair based on a random 32-byte seed
// // var seed = forge.random.getBytesSync(32);
// var keypair = ed25519.generateKeyPair({seed: seed});
// console.log(forge.util.bytesToHex(keypair.privateKey), typeof(keypair.privateKey));

// exit();
// // generate a random ED25519 keypair based on a "password" 32-byte seed
// var password = 'Mai9ohgh6ahxee0jutheew0pungoozil';
// var seed = new forge.util.ByteBuffer(password, 'utf8');
// var keypair = ed25519.generateKeyPair({seed: seed});
 
// // sign a UTF-8 message
// var signature = ED25519.sign({
//   message: 'test',
//   // also accepts `binary` if you want to pass a binary string
//   encoding: 'utf8',
//   // node.js Buffer, Uint8Array, forge ByteBuffer, binary string
//   privateKey: privateKey
// });
// // `signature` is a node.js Buffer or Uint8Array
 
// // sign a message passed as a buffer
// var signature = ED25519.sign({
//   // also accepts a forge ByteBuffer or Uint8Array
//   message: Buffer.from('test', 'utf8'),
//   privateKey: privateKey
// });
 
// // sign a message digest (shorter "message" == better performance)
// var md = forge.md.sha256.create();
// md.update('test', 'utf8');
// var signature = ED25519.sign({
//   md: md,
//   privateKey: privateKey
// });
 
// // verify a signature on a UTF-8 message
// var verified = ED25519.verify({
//   message: 'test',
//   encoding: 'utf8',
//   // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
//   signature: signature,
//   // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
//   publicKey: publicKey
// });
// // `verified` is true/false
 
// // sign a message passed as a buffer
// var verified = ED25519.verify({
//   // also accepts a forge ByteBuffer or Uint8Array
//   message: Buffer.from('test', 'utf8'),
//   // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
//   signature: signature,
//   // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
//   publicKey: publicKey
// });
 
// // verify a signature on a message digest
// var md = forge.md.sha256.create();
// md.update('test', 'utf8');
// var verified = ED25519.verify({
//   md: md,
//   // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
//   signature: signature,
//   // node.js Buffer, Uint8Array, forge ByteBuffer, or binary string
//   publicKey: publicKey
// });
import base58 from 'bs58';
import { Platform } from 'react-native'
import nacl, { randomBytes } from 'tweetnacl-sealed-box'
// import CryptoJS from 'crypto-js';
// import { bip39 } from 'bip39';
const bip39 = require('bip39') // why is this via require and can't do import??
// import { generateSecureRandom } from 'react-native-securerandom';
const NONCE_LENGTH = 24

//https://gist.github.com/diafygi/90a3e80ca1c2793220e5/
export const bytesToHex = (byteArray) => Array.from(byteArray, (byte) => { return ('0' + (byte & 0xFF).toString(16)).slice(-2)}).join('');
export const hexToBytes = (hexString) => Buffer.from(hexString, 'hex');
export const hash = function(m) {return nacl.hash(m)} // sha512

// format unix timestamp to date MM/DD/YYYY
export const formatDate = (timestamp) => {
  const date = new Date(timestamp*1000);
  return date.toLocaleDateString();
}
export const myGoBack = (navigation) => {
  // console.log(navigation.getState().routes)
  const state_routes = navigation.getState().routes;
  if(state_routes.length < 2) return;
  const second_to_last_state = state_routes[state_routes.length - 2];
  navigation.navigate({key: second_to_last_state.key, params: second_to_last_state.params});
}
export const b58encodeKey = (key: Uint8Array): string => {
  return base58.encode(key);
}
export const b58decodeKey = (key: string): Uint8Array => {
  return base58.decode(key);
}
export function seed_to_key(seed: Uint8Array): nacl.SignKeyPair {
    // Given a seed generate curve25519 nacl.sign.keyPair
    // returns {secretKey: [bytes], publicKey: [bytes]}
    return nacl.sign.keyPair.fromSeed(seed.slice(0, 32)) 
}
export async function getRandom(strength: number) {
    console.log('getRandom(strength): ', strength)
    if(['ios', 'android', 'native'].includes(Platform.OS)) {
      throw new Error('getRandom not implemented for native')
      // return await generateSecureRandom(strength)
    } else {
        return randomBytes(strength)
    }
}
export function sign_msg(msg: Uint8Array, key: Uint8Array): Uint8Array {
    let signed = nacl.sign(msg, key)
    return signed
}
export function verify_msg(msg: Uint8Array, key: Uint8Array): Uint8Array | null {
    let verified = nacl.sign.open(msg, key)
    return verified
}
export function generate_curve25519_keypair_from(words: string, addenda: string | null) {
    let seed = bip39.mnemonicToSeedSync(words, addenda)
    return nacl.box.keyPair.fromSecretKey(seed.slice(0, 32))
}
export function generate_curve25519_keypair() {
    // TODO should not use this
    // replace with getRandom and then genKey manually from is to ensure we 
    return nacl.box.keyPair()
}
export function box(msg: Uint8Array, public_key: Uint8Array, private_key: Uint8Array): Uint8Array {
    let nonce = nacl.randomBytes(NONCE_LENGTH)
    let box = nacl.box(msg, nonce, public_key, private_key)
    return joinByteArrays(nonce, box)
}
export function open_box(sealed_box, public_key, private_key) {
    let nonce = new Uint8Array(NONCE_LENGTH)
    for(let i = 0; i < NONCE_LENGTH; i++) nonce[i] = sealed_box[i]
    let enc = new Uint8Array(sealed_box.length - NONCE_LENGTH)
    for(let i = 0; i < enc.length; i++) enc[i] = sealed_box[i + NONCE_LENGTH]
    return nacl.box.open(enc, nonce, public_key, private_key) 
}
export function sealed_box(msg, public_key) {
    let nonce = nacl.randomBytes(NONCE_LENGTH)
    let box = nacl.sealedbox(msg, nonce, public_key)
    return joinByteArrays(nonce, box)
}
export function open_sealed_box(sealed_box, private_key) {
    let nonce = new Uint8Array(NONCE_LENGTH)
    for(let i = 0; i < NONCE_LENGTH; i++) nonce[i] = sealed_box[i]
    let enc = new Uint8Array(sealed_box.length - NONCE_LENGTH)
    for(let i = 0; i < enc.length; i++) enc[i] = sealed_box[i + NONCE_LENGTH]
    return nacl.sealedbox.open(enc, nonce, private_key)
}
export function secret_box(message, key) { // key size 32bytes / 256bits
    let nonce = nacl.randomBytes(NONCE_LENGTH)
    let box = nacl.secretbox(message, nonce, key)
    return joinByteArrays(nonce, box)
}
export function open_secret_box(secret_box, key) {
    let nonce = new Uint8Array(NONCE_LENGTH)
    for(let i = 0; i < NONCE_LENGTH; i++) nonce[i] = secret_box[i]
    let enc = new Uint8Array(secret_box.length - NONCE_LENGTH)
    for(let i = 0; i < enc.length; i++) enc[i] = secret_box[i + NONCE_LENGTH]
    return nacl.secretbox.open(enc, nonce, key)
}
export function joinByteArrays(a, b) {
    let out = new Uint8Array(a.length + b.length)
    out.set(a)
    out.set(b, a.length)
    return out
}
// shamir secret sharing
// https://github.com/jwerle/shamirs-secret-sharing
// import sss from 'shamirs-secret-sharing'
// export function shamirSplit(key, total, threshold) { // m of n
//     console.log('[shamirSplit] '+threshold+' of '+total+' shares total')
//     let shares = sss.split(Buffer.from(key), {
//         shares: total,
//         threshold: threshold
//     })
//     return shares
// }
// export function shamirCombine(shares) {
//     let key = sss.combine(shares)
//     return key
// }

export function handleChange(e) {
    this.setState({
        ...this.state, 
        [e.target.name]: e.target.value
    });
}
export function trim_and_lower(s) {
    return s.trim().toLowerCase()
}
export function toHHMMSS(m) {
    return ("0" + m.getUTCHours()).slice(-2) + ":" +
        ("0" + m.getUTCMinutes()).slice(-2) + ":" +
        ("0" + m.getUTCSeconds()).slice(-2)
}
export function toYYYYMMDD(m) {
    return m.getUTCFullYear() + "-" +
    ("0" + (m.getUTCMonth()+1)).slice(-2) + "-" +
    ("0" + m.getUTCDate()).slice(-2)
}
export function toYYYYMMDD_HHMMSS(m) {
    return toYYYYMMDD(m) + ' ' + toHHMMSS(m)
}
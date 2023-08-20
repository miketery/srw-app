import { v4 as uuidv4 } from 'uuid'
import base58 from 'bs58'

const bip39 = require('bip39') // mnemonic
const _bip32 = require('bip32') // HD keys
import * as ecc from 'tiny-secp256k1' 
const bip32 = _bip32.BIP32Factory(ecc)

import Vault from './Vault'
import SmartWallet from './SmartWallet'

import { bytesToHex, getRandom, hexToBytes } from '../lib/utils'

import SI from './SI'

// Stores private key, belongs to vault
// Smart wallet has paritcipants
// a participant will have a public key shared with signer
// Can sign messages, can verify signature with public key
export default class Signer { // secp256k1.Signer
    pk: string // s_publicKey base58 encoded
    vault_pk: string
    wallet_pk: string
    privateKey: Uint8Array // can eventually remove, derive from Vault
    publicKey: Uint8Array
    signature: Uint8Array
    //
    isHD: boolean = false
    path: string = ''
    index: number = 0
    
    constructor(pk: string,
            vault_pk: string,
            wallet_pk: string,
            privateKey: Uint8Array,
            publicKey: Uint8Array,
            signature: Uint8Array,
            path?: string,
            index?: number) {
        this.pk = pk
        this.vault_pk = vault_pk
        this.wallet_pk = wallet_pk
        this.privateKey = privateKey
        // derive from private key
        this.publicKey = publicKey
        this.signature = signature
        if(path != '') {
            this.isHD = true
            this.path = path
            this.index = index
        } else { 
            this.isHD = false
        }
        this.pk = 's_' + base58.encode(this.publicKey)
    }
    static async create(vault: Vault,
            wallet: SmartWallet,
            path: string='', index: number=0): Promise<Signer> {
        console.log('[Signer.create]')
        let privateKey: Uint8Array,
            random_bytes: Uint8Array,
            words: string,
            seed: Uint8Array
        if(path === '') {
            do {
                random_bytes = await getRandom(32)
                words = bip39.entropyToMnemonic(random_bytes)
                seed = bip39.mnemonicToSeedSync(words)
                privateKey = seed.slice(0, 32)
            } while(!ecc.isPrivate(privateKey))
        } else {
            console.log('[Signer.create] path', path)
            const seed = bip39.mnemonicToSeedSync(vault.words)
            const root = bip32.fromSeed(seed)
            const node = root.derivePath(path)
            privateKey = node.privateKey
            console.log(bytesToHex(privateKey))
            console.log(bytesToHex(node.publicKey)) 
        }
        const publicKey = ecc.pointFromScalar(privateKey)
        console.log(bytesToHex(publicKey))
        const signature = vault.signMsg(publicKey).slice(0,64)
        // const verified = vault.verifyMsg(publicKey, signature)
        // console.log(bytesToHex(verified))
        return new Signer('s_' + uuidv4(),
            vault.pk, wallet.pk, privateKey,
            publicKey, signature, path, index)
    }
    static async load(pk: string) {
        console.log('[Signer.load]', pk)
        const data = await SI.get(pk)
        return Signer.fromDict(data)
    }
    static async getAll(vault_pk: string): Promise<Signer[]> {
        return SI.getAll('signers', vault_pk).then(data => {
            return data.map(d => {
                let signer = Signer.fromDict(d)
                return signer
            })
        })
    }
    async save(): Promise<void> {
        return SI.saveAsync(this.pk, this.toDict())
    }
    static async getByWalletPk(vault_pk: string, wallet_pk: string) {
        const signers = await Signer.getAll(vault_pk)
        const signer = signers.find(s => s.wallet_pk === wallet_pk)
        if(signer === undefined)
            throw new Error('Signer not found')
        return signer
    }
    static fromDict(dict: {
            pk: string,
            wallet_pk: string,
            vault_pk: string,
            privateKey: string,
            publicKey: string,
            signature: string,
            path: string,
            index: number,
        }): Signer {
        return new Signer(
            dict.pk,
            dict.vault_pk,
            dict.wallet_pk,
            base58.decode(dict.privateKey),
            base58.decode(dict.publicKey),
            base58.decode(dict.signature),
            dict.path,
            dict.index,
        )
    }
    toDict(): any {
        return {
            pk: this.pk,
            vault_pk: this.vault_pk,
            wallet_pk: this.wallet_pk,
            privateKey: base58.encode(this.privateKey),
            publicKey: base58.encode(this.publicKey),
            signature: base58.encode(this.signature),
            path: this.path,
            index: this.index,
        }
    }
    // TODO: not sure if these work... lol...
    sign(message: Uint8Array) {
        return ecc.sign(message, this.privateKey)
    }
    verify(hash: Uint8Array, signature: Uint8Array) {
        return ecc.verify(hash, this.publicKey, signature)
    }
}
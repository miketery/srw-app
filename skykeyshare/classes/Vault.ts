import { binToBase64 } from '@bitauth/libauth'
import axios from 'axios'
import base58 from 'bs58'
import { BASE, DEBUG } from '../config'
const bip39 = require('bip39')

import { bytesToHex, hexToBytes, seed_to_key, 
    sign_msg, generate_curve25519_keypair_from, getRandom,
    joinByteArrays, verify_msg,
} from '../lib/utils'
import SI from './SI'
import Signer from './Signer'
import SmartWallet from './SmartWallet'
import { CoinTypes, NetworkTypes, PATH, Wallet, WalletTypes } from './Wallet'

const colors = ['Red', 'Yellow', 'Orange', 'Green', 'Blue',
    'Purple', 'Pink','Navy', 'White', 'Black']

function randomName() {
    return colors[Math.floor(Math.random() * colors.length)] + Math.floor(Math.random() * 100)
}

const _state = {
    ts: 0,
    signed_ts: [],
    verify_key: ''
}

export default class Vault {
    pk: string
    name: string
    my_name: string
    email: string
    short_code: string
    timestamp: number
    // secret stuff
    seed = null
    words = ''
    // signing key (ed25519)
    signing_key = Uint8Array.from([])
    verify_key = Uint8Array.from([])
    // encryption key (curve25519)
    private_key = Uint8Array.from([])
    public_key = Uint8Array.from([])
    public_key_signature = Uint8Array.from([])
    signer_index: number
    // server
    server_registered = ''

    async genWords(entropy=null, strength=16): Promise<string> {
        console.log('[Vault.genWords]')
        // entropy is bytes array is not null
        if(entropy === null)
            entropy = await getRandom(strength)
        let words = bip39.entropyToMnemonic(entropy)
        this.setWords(words)
        return this.words
    }
    didMethod(): string {
        // https://github.com/multiformats/multicodec/blob/master/table.csv#L94
        // https://github.com/w3c-ccg/did-method-key/issues/35
        const MULTICODE = new Uint8Array([237, 1])
        let out = new Uint8Array(2 + 32)
        out.set(MULTICODE)
        out.set(this.verify_key, MULTICODE.length)
        return 'did:key:z' + base58.encode(out)
    }
    inviteString(): string {
        return this.verifyKeyBase58() + '_' + this.publicKeyBase58()
    }
    verifyKeyBase58(): string {
        return base58.encode(this.verify_key)
    }
    publicKeyBase58(): string {
        return base58.encode(this.public_key)
    }
    verify_keyHex(): string {
        return bytesToHex(this.verify_key)
    }
    setWords(words: string): void {
        console.log('[Vault.setWords]')
        this.words = words
        // pbkdf2_hmac("sha512", words, 'mnemonic' + password, 2048)
        this.seed = bip39.mnemonicToSeedSync(this.words)
        console.log('seed: ' + base58.encode(this.seed))
    }
    create(my_name, email, callback, error_callback=null) {
        console.log('[Vault.create]')
        let name = ''
        if(name === null || name == '') {
            name = randomName()
        }
        this.name = name
        this.email = email
        this.my_name = my_name
        this.timestamp = Date.now()
        this.signer_index = 0
        DEBUG && console.log('timestamp', this.timestamp)
        // signing keypair (ed25519)
        let keypair_signing = seed_to_key(this.seed)
        this.signing_key = keypair_signing.secretKey
        this.verify_key = keypair_signing.publicKey
        DEBUG && console.log('signing', base58.encode(this.signing_key))
        DEBUG && console.log('verify_key', base58.encode(this.verify_key))
        // assymetric enc keypair (curve25519)
        let keypair_enc = generate_curve25519_keypair_from(this.words, '/sky/main')
        this.private_key = keypair_enc.secretKey
        this.public_key = keypair_enc.publicKey
        // sign
        let signed = sign_msg(this.public_key, this.signing_key)
        this.public_key_signature = signed.slice(0, signed.length - this.public_key.length)
        this.pk = this.getPk()

        // generate default wallets
        let wallets = []
        wallets[0] = this.createWallet('Default - BTC',
            CoinTypes.BTC, NetworkTypes.MAINNET, PATH)
        wallets[1] = this.createWallet('Testnet - BTC',
            CoinTypes.BTC, NetworkTypes.TESTNET, "m/44'/1'")
        this.registerOnline().then(res => {
            console.log(res)
            console.log(res.data)
            // TODO: might get short code to populate here...
            // this.short_code = res.data.short_code
        }).catch(err => {
            console.log(err)
            // error_callback(err)
        }).finally(() => {
            this.save(callback)
            // wallets[0].save(() => console.log('Saved', wallets[0].name))
            // wallets[1].save(() => console.log('Saved', wallets[1].name))
            wallets.forEach(w => {
                w.save(() => console.log('Saved', w.name))
                const p2wpkh = w.receive_nodes[0].address
                const payload = this.createSignedPayload({
                    p2wpkh: p2wpkh,
                    coin_type: w.coin_type,
                    network: w._network,
                    signed_addresses: binToBase64(this.signDict({p2wpkh: p2wpkh})),
                })
                console.log(payload)
                axios.post(BASE + '/wallet/address/add/', payload)
                    .then(res => console.log(res))
                    .catch(err => console.log(err))
            })
        })
    }
    async registerOnline() {
        return axios.post(BASE + '/user/register/', this.createSignedPayload({
            name: this.my_name,
            email: this.email,
            verify_key: this.verifyKeyBase58(),
            public_key: this.publicKeyBase58(),
            public_key_signature: bytesToHex(this.public_key_signature),
        })).then(res => {
            this.short_code = res.data.short_code
            this.server_registered = 'skycastle.dev'
            return res
        })
    }
    getPk(): string {
        return 'v_' + this.verifyKeyBase58()
    }
    signDict(data: Object): Uint8Array {
        const encoder = new TextEncoder()
        const payload = encoder.encode(JSON.stringify(data))
        return this.signMsg(payload)
    }
    signMsg(msg: Uint8Array): Uint8Array {
        return sign_msg(msg, this.signing_key)
    }
    verifyMsg(msg: Uint8Array, signature: Uint8Array=null): Uint8Array {
        if(signature)
            return verify_msg(joinByteArrays(signature, msg), this.verify_key)
        return verify_msg(msg, this.verify_key)
    }
    createSignedPayload(data: Object): {signed: string, verify_key: string} {
        const encoder = new TextEncoder()
        const sig_ts = Math.round(Date.now() / 1000)
        data['sig_ts'] = sig_ts
        const signed = this.signDict(data)
        return {
            signed: binToBase64(signed),
            verify_key: this.verifyKeyBase58(),
        }
    }
    toDict() {
        return {
            pk: this.pk,
            name: this.name,
            my_name: this.my_name,
            email: this.email,
            short_code: this.short_code,
            words: this.words,
            seed: base58.encode(this.seed),
            signing_key: base58.encode(this.signing_key),
            verify_key: base58.encode(this.verify_key),
            private_key: base58.encode(this.private_key),
            public_key: base58.encode(this.public_key),
            public_key_signature: base58.encode(this.public_key_signature),
            timestamp: this.timestamp,
            server_registered: this.server_registered,
            signer_index: this.signer_index,
        }
    }
    save(callback): void {
        SI.save(this.getPk(), this.toDict(), callback)
    }
    static async load(pk: string): Promise<Vault> {
        let vault = new Vault()
        console.log('[Vault.load]', pk)
        const data = await SI.get(pk)
        vault.fromDict(data)
        return vault
    }
    fromDict(data: Object): void {
        console.log('[Vault.fromDict]')
        DEBUG && console.log(data)
        this.pk = data['pk']
        this.name = data['name']
        this.my_name = data['my_name']
        this.email = data['email'] || ''
        this.short_code = data['short_code'] || ''
        this.words = data['words']
        this.seed = base58.decode(data['seed'])
        this.signing_key = base58.decode(data['signing_key'])
        this.verify_key = base58.decode(data['verify_key'])
        this.private_key = base58.decode(data['private_key'])
        this.public_key = base58.decode(data['public_key'])
        this.public_key_signature = base58.decode(data['public_key_signature'])
        this.timestamp = data['timestamp']
        this.server_registered = data['server_registered'] || ''
        this.signer_index = data['signer_index'] || 0
    }
    createWallet(name: string,
            coin_type: CoinTypes,
            network_type: NetworkTypes,
            path: string): Wallet {
        console.log('[Vault.createWallet]', name, coin_type, network_type, path)
        const notes = 'Created using same words as Vault seed phrase.\n\n' + 
            'PATH: ' + path
        return Wallet.createFromWords(this, name, this.words, 
            WalletTypes.BASIC, network_type, path, notes)
    }
    async createSigner(wallet: SmartWallet): Promise<Signer> {
        const signers = await Signer.getAll(this.pk)
        let max_index = -1
        signers.forEach(s => {
            if(s.index > max_index) max_index = s.index
        })
        if(max_index < this.signer_index)
            max_index = this.signer_index
        const index = max_index + 1
        const signer_path = PATH + "/1000'/" + index + "/0"
        const signer = Signer.create(this, wallet, signer_path, index)
        return signer
    }
    // getBackupFromServer() {
    // }
    // loadFromBackup() {
    // }
}


// store things encrypted
// store a hash of password
// password used to encrypt ecnryption key for rest
//

// master_password_has: hash
// vault_hashes: [hash]
// hash: encrypted_vault

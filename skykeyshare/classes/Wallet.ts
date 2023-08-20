import base58 from 'bs58'
import { v4 as uuidv4 } from 'uuid'

const bitcoin = require('bitcoinjs-lib')
const bip39 = require('bip39') // mnemonic
const _bip32 = require('bip32') // HD keys
// tiny-secp256k1, V1 works. V2 uses native bigint, doesn't work
// https://github.com/bitcoinjs/bip32/issues/55
import * as ecc from 'tiny-secp256k1' 
const bip32 = _bip32.BIP32Factory(ecc)
import { BIP32Interface } from 'bip32'
import { Network } from 'bitcoinjs-lib'

import { bytesToHex, hexToBytes, getRandom
} from '../lib/utils'
import SI from './SI'
import { TEST } from '../config'

import Vault from './Vault'
import { instantiateSecp256k1, Secp256k1, 
    flattenBinArray } from '@bitauth/libauth';
import { base58CheckEncode } from './wallet-utils'

import { addresses, transactions } from '../lib/esplora'
import SmartWallet from './SmartWallet'

enum WalletTypes {
    BASIC = 'basic',
    SMART = 'smart',
}
enum CoinTypes {
    BTC = 'BTC',
}
enum NetworkTypes {
    MAINNET = 'mainnet',
    TESTNET = 'testnet'
}
const PATH = "m/44'/0'"
const derive_look_ahead = 1 // TEST ? 4 : 8

const chain_stats = {funded_txo_count: 0, funded_txo_sum: 0, spent_txo_count: 0, spent_txo_sum: 0, tx_count: 0}
const stats = {address: '', chain_stats: {...chain_stats}, mempool_stats: {...chain_stats}}

export const mBTC = (sats: number): string => sats > 0 ? Math.floor(sats / 10**5).toString()
    : Math.ceil(sats / 10**5).toString() // returns mBTC (no lower 5)
export const submBTC = (sats: number): string => (Math.abs(sats)+10**5).toString().slice(-5) // returns lower 5
export const satsToMBTCStr = (sats: number): string => mBTC(sats) + '.' + submBTC(sats) + 'mBTC'

export function strToNetwork(network: NetworkTypes): Network {
    if (network === NetworkTypes.TESTNET) {
        return bitcoin.networks.testnet
    } else if (network === NetworkTypes.MAINNET) {
        return bitcoin.networks.bitcoin
    } else {
        throw new Error('Unknown network type')
    }
}

class Node {
    node: BIP32Interface
    stats: {
        address: string;
        chain_stats: {
            funded_txo_count: number;
            funded_txo_sum: number;
            spent_txo_count: number;
            spent_txo_sum: number;
            tx_count: number;
        };
        mempool_stats: {
            funded_txo_count: number;
            funded_txo_sum: number;
            spent_txo_count: number;
            spent_txo_sum: number;
            tx_count: number;
        };
    } = {...stats}
    chain_txs: Array<Object> = []
    mempool_txs: Array<Object> = []
    utxo: Array<Object> = []

    constructor(node: BIP32Interface) {
        this.node = node
    }
    static fromBase58 = (base58: string, network: Network): Node =>
        new Node(bip32.fromBase58(base58, network))
    toBase58 = (): string => this.node.toBase58()
    depth = (): number => this.node.depth
    pubKey = (): Buffer => this.node.publicKey
    toWIF = (): string => this.node.toWIF()
    // p2wpkh should be used!!!
    get address(): string { return this.p2wpkh() }
    p2wpkh = (): string => bitcoin.payments.p2wpkh({
        pubkey: this.pubKey(), network: this.node.network}).address
    p2pkh = (): string => bitcoin.payments.p2pkh({
        pubkey: this.pubKey(), network: this.node.network}).address
    p2sh_p2wpkh = ():string => bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({pubkey: this.pubKey()})
    }).address
    getPlainTextNetwork = ():string => {
        if(this.node.network.bech32 == 'bc')
            return 'mainnet'
        if(this.node.network.bech32 == 'tb')
            return 'testnet'
    }
    fetchTransactions = async (mempool=false): Promise<Boolean> => {
        console.log('[Node.fetchTransactions] mempool =',mempool)
        if(mempool) { // simply overwrite depending on what we get from mempool
            try { // upto 50, no paging!
                this.mempool_txs = await addresses.getAddressTxsMempool(this.p2wpkh(), this.getPlainTextNetwork())
            } catch(e) {
                console.log('[Node.fetchTransactions] mempool failed', this.p2wpkh())
                console.error(e)
            }
        }
        else {
            try {
                let last_seen = ''
                let already_stored = false // if last of fetched of fecthed is already stored, can stop
                let queued_txs = [] // on this run before we store
                const chain_txids = this.chain_txs.map(t => t['txid']) // all txids we have stored
                while(this.stats.chain_stats.tx_count > this.chain_txs.length + queued_txs.length
                        && !already_stored) {
                    // gets up to fifty txs since now, or after last_seen
                    let txs = await addresses.getAddressTxsChainAfter(this.p2wpkh(), last_seen, this.getPlainTextNetwork())
                    txs.map(t => queued_txs.push(t))
                    last_seen = txs[txs.length - 1].txid
                    already_stored = chain_txids.includes(last_seen)
                }
                const queued_count = queued_txs.length
                for(let i = 0; i < queued_count; i++) {
                    let curr = queued_txs.pop()
                    if(!chain_txids.includes(curr['txid'])) {
                        this.chain_txs.push(curr)
                        console.log('[Node.fetchTransactions] pushed: ', curr['txid'])
                    } else {
                        console.log('[Node.fetchTransactions] already have:', curr['txid'])
                    }
                }
                // GOOD TO DO ACCOUNTING CHECK
                // this.chain_t
            } catch(e) {
                console.log('[Node.fetchTransactions] failed', this.p2wpkh())
            }
        }
        return true
    }
    fetchStats = async (): Promise<Boolean> => {
        try {
            const old_mempool_stats = {...this.stats.mempool_stats}
            this.stats = await addresses.getAddress(this.p2wpkh(), this.getPlainTextNetwork())
            if(this.chain_txs.length != this.stats.chain_stats.tx_count) {
                // if chain tx count different always fetch both
                await this.fetchTransactions()
                await this.fetchTransactions(true)
            } else if(this.mempool_txs.length != this.stats.mempool_stats.tx_count || 
                    old_mempool_stats.tx_count != this.stats.mempool_stats.tx_count ||
                    old_mempool_stats.funded_txo_count != this.stats.mempool_stats.funded_txo_count ||
                    old_mempool_stats.funded_txo_sum != this.stats.mempool_stats.funded_txo_sum ||
                    old_mempool_stats.spent_txo_count != this.stats.mempool_stats.spent_txo_count ||
                    old_mempool_stats.spent_txo_sum != this.stats.mempool_stats.spent_txo_sum) {
                // TODO USE CACHE SINCE MEMPOOL TXS NOT STORED
                // if chain tx count diff or sums !eq, check if mempool tx is different
                console.log('[Node.fetchStats] mempool stats dont match local mempool tx')
                await this.fetchTransactions(true)
            } else {
                console.log('[Node.fetchStats] tx up to date')
            }
            return true
        } catch(e) {
            console.error(e)
            return false
        }
    }
    fetchUTXO = async (): Promise<Array<Object>> => {
        try {
            this.utxo = await addresses.getAddressTxsUtxo(this.p2wpkh(), this.getPlainTextNetwork())
            const output = bitcoin.payments.p2wpkh({
                pubkey: this.pubKey(), network: this.node.network
            }).output
            this.utxo.map(tx => tx['output'] = output)
            // TODO, can add other address types for same wallet... e.g. p2pkh, p2sh p2wpkh
            return this.utxo
        } catch(e) {
            console.error(e)
            return null
        }
    }
    getBalance = (mempool?: Boolean): number => {
        try {
            return mempool ? this.stats.mempool_stats.funded_txo_sum - this.stats.mempool_stats.spent_txo_sum :
            this.stats.chain_stats.funded_txo_sum - this.stats.chain_stats.spent_txo_sum
        } catch(e) {
            return 0
        }
    }
    toDict(): Object {
        return {
            node: this.toBase58(),
            stats: this.stats,
            chain_txs: this.chain_txs,
            // dont save mempool stats
        }
    }
    static fromDict(data: Object, network: Network): Node {
        let n = Node.fromBase58(data['node'], network)
        n.stats = data['stats']
        n.chain_txs = data['chain_txs']
        return n
    }
    debug(): void {
        console.log('Pub (hex):   ', bytesToHex(this.pubKey()))
        console.log('WIF:         ',
            this.node.isNeutered() ? '*neutered*' : this.toWIF())
        console.log('p2wpkh:      ', this.p2wpkh())
        console.log('p2pkh:       ', this.p2pkh())
        console.log('p2sh_p2wpkh: ', this.p2sh_p2wpkh())
    }
}

class Wallet {
    pk: string = null
    vault_pk: string = null
    name: string = null
    words: string = null // entropy
    wallet_type: WalletTypes = WalletTypes.BASIC
    coin_type: CoinTypes = CoinTypes.BTC
    notes: string = null
    seed: Uint8Array = new Uint8Array()
    root: BIP32Interface // TODO make this a node?
    path: string = PATH
    _network: NetworkTypes = NetworkTypes.MAINNET
    receive_nodes: Array<Node> = []
    change_nodes: Array<Node> = []

    last_fetch: number = 0 // timestamp of lastfetch (so doesnt spam api)

    // later
    // cold = false // i.e. private and seed removed
    // hd = null
    // particpants = null
    // owner = false
    // multi_sig = false
   
    constructor(pk: string, vault_pk: string, name: string, words: string,
        wallet_type: WalletTypes, coin_type: CoinTypes, notes: string,
        seed: Uint8Array, root: BIP32Interface, path: string, network: NetworkTypes,
        receive_nodes: Array<Node>, change_nodes: Array<Node>) {
        console.log('[Wallet.constructor]')
        this.pk = pk
        this.vault_pk = vault_pk
        this.name = name
        this.words = words
        this.wallet_type = wallet_type
        this.coin_type = coin_type
        this.notes = notes
        this.seed = seed
        this.root = root
        this.path = path
        this._network = network // plaintext network: 'mainnet' | 'testnet'
        this.receive_nodes = receive_nodes
        this.change_nodes = change_nodes
    }
    static async create(vault: Vault, name: string, 
            wallet_type: WalletTypes, network: NetworkTypes,
            notes: string=null): Promise<Wallet> {
        console.log('[Wallet.create]')
        // let wallet = new Wallet()
        let random_bytes: Uint8Array, words: string, seed: Uint8Array
        do {
            random_bytes = await getRandom(16) // 16 * 8 = 128
            words = bip39.entropyToMnemonic(random_bytes)
            seed = bip39.mnemonicToSeedSync(words)
        } while(!ecc.isPrivate(seed.slice(0, 32)))
        console.log('[Wallet.create] words', words)
        console.log('[Wallet.create] seed', base58.encode(seed))
        let root = bip32.fromSeed(seed, strToNetwork(network))
        let w = new Wallet('w_' + uuidv4(), 
            vault.pk, name, words, wallet_type, CoinTypes.BTC, notes,
            seed, root, PATH, network, [], [])
        w.deriveNodes()
        return w
    }
    static createFromWords(vault: Vault, name: string, words: string,
            wallet_type: WalletTypes, network: NetworkTypes, path: string,
            notes: string=null): Wallet {
        console.log('[Wallet.createFromWords]')
        let seed = bip39.mnemonicToSeedSync(words)
        let root = bip32.fromSeed(seed, strToNetwork(network))
        let w = new Wallet('w_' + uuidv4(), 
            vault.pk, name, words, wallet_type, CoinTypes.BTC, notes,
            seed, root, path, network, [], [])
        w.deriveNodes()
        return w
    }
    getBalance(mempool?:boolean): number {
        return [...this.receive_nodes, ...this.change_nodes]
        .reduce((partial, n) => partial + n.getBalance(mempool), 0)
    }
    getWIF() {
        
    }
    deriveRoot(): void {
        this.root = bip32.fromSeed(this.seed, this.network)
    }
    deriveNodes(hardened_index=0): void {
        const derived = this.root.derivePath(this.path)
        for(let i = 0; i < derive_look_ahead; i++) {
            this.receive_nodes.push(new Node(
                derived.deriveHardened(hardened_index).derive(0).derive(i)))
            this.change_nodes.push(new Node(
                derived.deriveHardened(hardened_index).derive(1).derive(i)))
        }
    }
    getTransactions(mempool?:boolean): Array<Object> {
        let transactions = [...this.receive_nodes, ...this.change_nodes].map(
            n => mempool ? n.mempool_txs : n.chain_txs
            )
        console.log('[Wallet.getTransactions]', mempool ? 'mempeool' : 'chain')
        return mempool ? transactions.flat() :
        transactions.flat().sort((a, b) => a['status']['block_time'] - b['status']['block_time'])
    }
    getAllP2WPKH(): Array<String> {
        return [...this.receive_nodes, ...this.change_nodes].map(
            n => n.p2wpkh()
        )
    }
    getReceiveAddresses(): Array<String> {
        return this.receive_nodes.map(n => n.p2wpkh())
    }
    async fetchStats(): Promise<Boolean> {
        const results_a = await Promise.all(this.receive_nodes.map(n => n.fetchStats()))
        // const results_b = await Promise.all(this.change_nodes.map(n => n.fetchStats()))
        this.last_fetch = Date.now()
        this.save(() => console.log('[Wallet.fetchStats] saved'))
        return true
    }
    async fetchUTXO(): Promise<Array<Object>> {
        const results = await Promise.all([...this.receive_nodes, ...this.change_nodes].map(
            n => n.fetchUTXO()
        ))
        return results.flat()
    }
    static async load(pk: string): Promise<Wallet|SmartWallet> {
        console.log('[Wallet.load]', pk)
        const data = await SI.get(pk)
        return Wallet.fromDict(data)
    }
    get network(): Network {
        return strToNetwork(this._network)
    }
    static fromDict(data: any): Wallet | SmartWallet{
        if(data.wallet_type === WalletTypes.SMART) {
            console.log('[Wallet.fromDict] SmartWallet')
            return SmartWallet.fromDict(data)
        }
        console.log('[Wallet.fromDict]', data)
        // needed for node setup
        const network = strToNetwork(data['network'])
        return new Wallet(
            data.pk,
            data.vault_pk,
            data.name,
            data.words,
            (data['wallet_type'] == '' || data['wallet_type'] =='individual')
                ? 'basic' : data['wallet_type'],
            data['coin_type'],
            data['notes'],
            base58.decode(data['seed']),
            bip32.fromBase58(data['root'], network),
            data['path'],
            data['network'],
            data['receive_nodes'].map(n => Node.fromDict(n, network)),
            data['change_nodes'].map(n => Node.fromDict(n, network))
        )
    }
    toDict(): any {
        return {
            pk: this.pk,
            vault_pk: this.vault_pk,
            name: this.name,
            network: this._network,
            wallet_type: this.wallet_type,
            notes: this.notes,
            words: this.words,
            seed: base58.encode(this.seed),
            root: this.root.toBase58(),
            receive_nodes: this.receive_nodes.map(n => n.toDict()),
            change_nodes: this.change_nodes.map(n => n.toDict()),
            last_fetch: this.last_fetch,
        }
    }
    save(callback: Function=()=>console.log('saved wallet')): void {
        SI.save(this.pk, this.toDict(), callback)
    }
}

export {
    PATH,
    chain_stats, stats,
    WalletTypes,
    CoinTypes,
    NetworkTypes,
    Wallet,
    Node
}
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const bitcoin = require('bitcoinjs-lib')
const bip39 = require('bip39') // mnemonic
import * as ecc from 'tiny-secp256k1' 
import base58 from 'bs58'

import { Network } from 'bitcoinjs-lib'
import { addresses, transactions } from '../lib/esplora'

import SI from './SI'
import { bytesToHex, hexToBytes, joinByteArrays, verify_msg } from '../lib/utils'

import Vault from './Vault'
import { NetworkTypes, strToNetwork, WalletTypes, chain_stats, stats, CoinTypes } from './Wallet'
import WalletTemplates, { WalletTemplateTypes } from './WalletTemplates'
import Contact from './Contact'
import { MessageOut } from './Message'
import Signer from './Signer'
import Participant, { ParticipantStates } from './Participant'

import { WALLET_CREATE_ENDPOINT, WALLET_PARTICIPANT_KEY_ADD_ENDPOINT } from '../config'


export enum Steps {
    TYPE_SELECT = 1,
    NAME_AND_NETWORK = 2,
    TEMPLATE_SELECT = 3 , // E.g. 2 of 3 multisig, etc.
    PARTICPANTS = 4, // Contacts (Signers / Viewers), and public keys
    DETAILS = 5, // e.g. specify T (threshold) in T of N
    CONFIRM = 6, // Confirm details
}

export enum WalletStates {
    INIT = 'init', // draft mode can edit template & participants
    PENDING = 'pending', // waitin for participants to accept
    ACTIVE = 'active', // locked in, generate script hash (cant change script anymore)
    ARCHIVED = 'archived',
}

class ScriptNode {
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

    _network: NetworkTypes
    script_hash: Uint8Array
    script: Uint8Array
    output: Uint8Array

    constructor(script: Uint8Array, script_hash: Uint8Array, output: Uint8Array, network: NetworkTypes) {
        this.script = script
        this.script_hash = script_hash
        this.output = output
        // script_hash == bitcoin.payments.p2wsh({output: this.script}).hash
        // output == bitcoin.payments.p2wsh({output: this.script}).output
        this._network = network
    }
    get network(): Network {
        return strToNetwork(this._network)
    }
    get address(): string {
        return bitcoin.payments.p2wsh({
            // output: this.output,
            // network: this.network,
            redeem: {
                output: this.script,
                network: this.network,
            },
        }).address
    }
    fetchTransactions = async (mempool=false): Promise<Boolean> => {
        console.log('[Node.fetchTransactions] mempool =',mempool)
        if(mempool) { // simply overwrite depending on what we get from mempool
            try { // upto 50, no paging!
                this.mempool_txs = await addresses.getAddressTxsMempool(this.address, this._network)
            } catch(e) {
                console.log('[Node.fetchTransactions] mempool failed', this.address)
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
                    let txs = await addresses.getAddressTxsChainAfter(this.address, last_seen, this._network)
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
            } catch(e) {
                console.log('[Node.fetchTransactions] failed', this.address)
            }
        }
        return true
    }
    fetchStats = async (): Promise<Boolean> => {
        try {
            const old_mempool_stats = {...this.stats.mempool_stats}
            this.stats = await addresses.getAddress(this.address, this._network)
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
            this.utxo = await addresses.getAddressTxsUtxo(this.address, this._network)
            // const output = bitcoin.payments.p2wpkh({
            //     pubkey: this.pubKey(), network: this._network
            // }).output
            // this.utxo.map(tx => tx['output'] = outputScript) ???
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
            stats: this.stats,
            chain_txs: this.chain_txs,
            // dont save mempool stats
            script: bytesToHex(this.script),
            scriptHash: bytesToHex(this.script_hash),
            output: bytesToHex(this.output),
            address: this.address,
        }
    }
    static fromDict(data: Object, network: NetworkTypes): ScriptNode {
        try {
            let n = new ScriptNode(
                hexToBytes(data['script']),
                hexToBytes(data['script_hash']),
                hexToBytes(data['output']),
                network)
            n.stats = data['stats']
            n.chain_txs = data['chain_txs']
            return n
        } catch {
            return null
        }
    }
}

export default class SmartWallet {
    pk: string
    vault_pk: string
    name: string
    owner: string
    wallet_type: WalletTypes
    wallet_state: WalletStates
    _network: NetworkTypes
    coin_type: CoinTypes
    // entityFor
    // originator
    private _participants: Participant[] = []
    private _template: WalletTemplateTypes  // e.g. T of N Multi-Signature
    opts: any = {}
    contract: string  // describe purpose of this wallet    
    created: number  // timestamp
    step: Steps

    node: ScriptNode

    constructor(pk: string, vault_pk: string, name: string, owner: string,
            wallet_type: WalletTypes,
            wallet_state: WalletStates,
            network: NetworkTypes, coin_type: CoinTypes,
            template: WalletTemplateTypes,
            participants: Participant[] = [],
            opts: any = {},
            contract?: string, node?: ScriptNode,
            created?: number, step?: Steps) {
        this.pk = pk
        this.vault_pk = vault_pk
        this.name = name
        this.owner = owner
        this.wallet_type = wallet_type
        this.wallet_state = wallet_state
        this._network = network
        this.coin_type = coin_type
        this._template = template
        this._participants = participants
        this.opts = opts
        this.contract = contract
        this.node = node
        // this.script = script    // redeem.output
        // this.scriptHash = scriptHash // sha256(script)
        // this.output = output    // 0020[scriptHash]
        this.created = created || Date.now()
        this.step = step || Steps.NAME_AND_NETWORK
    }
    get network(): Network {
        return strToNetwork(this._network)
    }
    static create(vault: Vault,
            name: string,
            wallet_type: WalletTypes,
            network: NetworkTypes,
            coin_type: CoinTypes,
            template: WalletTemplateTypes) {
        return new SmartWallet(
            'z_' + uuidv4(),
            vault.pk, // belongs to this vault
            name,
            vault.verifyKeyBase58(), // owner (i.e. me)
            wallet_type,
            WalletStates.INIT,
            network,
            coin_type,
            template,
        )
    }
    static fromDict(dict: any): SmartWallet {
        return new SmartWallet(
            dict.pk,
            dict.vault_pk,
            dict.name,
            dict.owner,
            dict.wallet_type,
            dict.wallet_state,
            dict.network,
            dict.coin_type || CoinTypes.BTC,
            dict.template,
            dict.participants.map(p => Participant.fromDict(p)),
            dict.opts,
            dict.contract,
            ScriptNode.fromDict(dict.node, dict.network),
            dict.created,
            dict.step || Steps.NAME_AND_NETWORK,
        )
    }
    toDict(): any {
        return {
            pk: this.pk,
            vault_pk: this.vault_pk,
            name: this.name,
            owner: this.owner,
            wallet_type: this.wallet_type,
            wallet_state: this.wallet_state,
            network: this._network,
            coin_type: this.coin_type,
            template: this._template,
            participants: this._participants.map(p => p.toDict()),
            opts: this.opts,
            contract: this.contract,
            node: this.wallet_state == WalletStates.ACTIVE ? this.node.toDict() : {},
            created: this.created,
            step: this.step,
        }
    }
    static async load(pk: string): Promise<SmartWallet> {
        console.log('[Wallet.load]', pk)
        const data = await SI.get(pk)
        return SmartWallet.fromDict(data)
    }
    async save(): Promise<void> {
        return SI.saveAsync(this.pk, this.toDict())
    }
    get template(): any {
        return WalletTemplates[this._template]
    }
    resetParticipants(): void {
        if(this.wallet_state !== WalletStates.INIT)
            throw new Error('Wallet is not in init state')
        this._participants = []
    }
    get participants(): Participant[] {
        return this._participants
    }
    getParticipant(verify_key: Uint8Array): Participant {
        return this._participants.find(p =>
            base58.encode(p.verify_key) === base58.encode(verify_key))
    }
    addParticipant(participant: Participant) {
        if(this.wallet_state !== WalletStates.INIT)
            throw new Error('Wallet is not in init state')
        if(this.getParticipant(participant.verify_key))
            throw new Error('Participant already exists')
        this._participants.push(participant)
    }
    removeParticipant(verify_key: Uint8Array) {
        if(this.wallet_state !== WalletStates.INIT)
            throw new Error('Wallet is not in init state')
        this._participants = this._participants.filter(p => 
            base58.encode(p.verify_key) !== base58.encode(verify_key))
    }
    updateParticipant(participant: Participant) {
        // if(!this.canUpdate)
        //     throw new Error('Wallet is not in init or pending state')
        // this._participants = [
        //     ...this.participants.filter(p => p.verify_key_base58 !== participant.verify_key_base58),
        //     participant
        // ]
        // console.log(this.participants)
    }
    finalize() {
        if(this.wallet_state !== WalletStates.INIT)
            throw new Error('SmartWallet is not in init state')
        const p2wsh = this.template.create(2, this._participants, this.network)
        this.node = new ScriptNode(p2wsh.redeem.output,
            p2wsh.hash,
            p2wsh.output, 
            this._network)
        // now the wallet is active and cant finalize again nor change participants
        this.wallet_state = WalletStates.ACTIVE
    }
    get address(): string {
        try {
            return this.node.address
        } catch {
            return null
        }
    }
    get script(): Uint8Array {
        return this.node.script
    }
    getBalance(mempool?: Boolean): number {

        return 0
    }
    canUpdate(): Boolean {
        return [WalletStates.INIT, WalletStates.PENDING].includes(
            this.wallet_state
        )
    }
    async createOnServer(vault: Vault) {
        const data = {
            ...this.toDict(),
            wallet_pk: this.pk
        }
        return axios.post(WALLET_CREATE_ENDPOINT, vault.createSignedPayload(data))
            .then(res => {
                console.log(res.data)
            }).catch(err => {
                console.error(err)
            })
    }
    async addParticipantKey(vault: Vault, verify_key: Uint8Array, public_key: Uint8Array, signature: Uint8Array): Promise<Boolean> {
        if(!this.canUpdate())
            throw new Error('Cant update SmartWallet; ' + this.pk)
        const participant = this.getParticipant(verify_key)
        const payload = {
            wallet_pk: this.pk, 
            participant: {
                verify_key: participant.verify_key_base58,
                public_key: {
                    public_key: base58.encode(public_key),
                    signature: bytesToHex(signature)
                }
            } 
        }
        if(participant.addKey(public_key, signature))
            return axios.post(WALLET_PARTICIPANT_KEY_ADD_ENDPOINT, 
                vault.createSignedPayload(payload))
                .then(res => {
                    if(res.status === 200)
                        return true
                    else
                        throw new Error('Server error')
                })
                .catch(err => {
                    console.log(err)
                    return false
                })
        return false
    }
    // ################################################################################
    // NOTIFICATIONS
    invitePayload(): any {
        let payload = this.toDict()
        delete payload['vault_pk']
        return payload
    }
    async sendInvites(vault: Vault): Promise<Boolean[]> {
        const payload = this.invitePayload()
        return Promise.all(this.participants
            .filter(p => !p.isMe(vault))
            .map(p => p.sendInvite(payload, vault))
        ).then(results => {
            this.save()
            return results
        })
    }
    // END NOTIFICATION
    // ################################################################################
}

export async function createSignerForWallet(vault: Vault, wallet: SmartWallet): Promise<Boolean> {
    // check if already have a key
    const participant = wallet.getParticipant(vault.verify_key)
    if(participant.publicKeys.length > 0) {
        console.log('[process_wallet_invite] Already has keys:', participant.publicKeys.length)
        return false
    }
    // create signer, but check if already exists for wallet
    let signer: Signer
    let new_signer = false
    try {
        // get signer for this wallet
        signer = await Signer.getByWalletPk(vault.pk, wallet.pk)
    } catch {
        // create signer
        signer = await vault.createSigner(wallet)
        new_signer = true
        // signer = await Signer.create(vault, wallet)
    }
    // const signer = await Signer.create(vault, wallet)
    return signer.save().then(() => {
        if(signer.index > vault.signer_index) {   
            vault.signer_index = signer.index
            vault.save(null) // if new signer, save vault, otherwise found existing signer
        }
        wallet.addParticipantKey(vault, vault.verify_key, signer.publicKey, signer.signature)
        wallet.save()
        return true
    }).catch(err => {
        console.error(err)
        return false
    })
}

async function sendWalletAccept(vault: Vault, wallet: SmartWallet): Promise<Boolean> {
    console.log('[sendWalletAccept]', vault.pk, wallet.pk)
    const participant = wallet.getParticipant(vault.verify_key)
    const contact = await Contact.getByVerifyKey(wallet.owner)
    const data = {
        payload: {
            wallet_pk: wallet.pk,
            participant: participant.toDict()
        },
        type_name: 'wallet_accept',
    }
    const m = new MessageOut(data, contact)
    return m.send(vault).then(response => {
        if(response['status'] == 201) {
            return true
        }
        return false
    })
}


// accepting an invite
export async function process_wallet_invite(wallet_invite: any, vault: Vault): Promise<any> {
    console.log('[process_wallet_invite]', wallet_invite)
    const d = {...wallet_invite.data.payload, vault_pk: vault.pk}
    // check I'm one of the participants
    if(!d.participants.find(p => p.verify_key === vault.verifyKeyBase58()))
        throw new Error('You are not a participant of this wallet')
    // check if wallet already exists
    let wallet: SmartWallet
    try {
        wallet = await SmartWallet.load(d.pk)
        console.log('[process_wallet_invite] Wallet already exists!!!!')
        // return false
    } catch {
        wallet = SmartWallet.fromDict(d)
        await wallet.save()
        // doesnt exist, as it should be!!!
    }
    if(!createSignerForWallet(vault, wallet))
        return {error: 'Error acceping invite, and creating signer for wallet'}
    if(!sendWalletAccept(vault, wallet)) 
        return {error: 'Error sending wallet accept'}
    return {pk: wallet.pk}
}


export async function process_wallet_accept(wallet_accept: any): Promise<void> {
    const payload = wallet_accept.data.payload
    console.log('[process_wallet_accept]', payload)
    const wallet = await SmartWallet.load(payload.wallet_pk)
    const participant = wallet.getParticipant(
        base58.decode(payload.participant.verify_key))
    for(const key of payload.participant.publicKeys) {
        participant.addKey(base58.decode(key.publicKey), hexToBytes(key.signature))
    }
    participant.state = ParticipantStates.ACCEPTED
    // wallet.updateParticipant(participant)
    return wallet.save()
}

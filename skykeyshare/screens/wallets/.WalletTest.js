import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { CommonActions } from '@react-navigation/native'

import tw from '../../lib/tailwind'

import ds from '../../assets/styles'
import SI from '../../classes/SI'
import { instantiateSecp256k1, instantiateSha256, instantiateSha512, instantiateRipemd160,
    deriveHdPrivateNodeFromSeed, deriveHdPath, encodeHdPrivateKey, deriveHdPublicNode, encodeHdPublicKey, bip32HmacSha512Key  } from '@bitauth/libauth';
// https://github.com/bitauth/libauth/blob/13454f1f6b3d9e87b6361cc71f082950fe6abf3a/src/lib/transaction/fixtures/template.2-of-3.spec.helper.ts

import {sha256, sha512, ripemd160, checksum, p2pkh, base58CheckEncode } from '../../classes/wallet-utils'
import { getRandom, bytesToHex, joinByteArrays, hexToBytes } from '../../lib/utils'
const bip39 = require('bip39') // why is this via require and can't do import??
import base58 from 'bs58'
const bitcoin = require('bitcoinjs-lib')

// const ecc = require('tiny-secp256k1')
import * as ecc from 'tiny-secp256k1'
const mybip32 = require('bip32');

const bip32 = mybip32.BIP32Factory(ecc)
import { BIP32Interface } from 'bip32'

import { Node, CoinTypes, NetworkTypes, PATH } from '../../classes/Wallet'

// https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/addresses.spec.ts
// script codes https://en.bitcoin.it/wiki/Script

// import bitcore from 'bitcore-lib'
// https://www.npmjs.com/package/bitcore-lib bitcore
//      https://blog.logrocket.com/sending-bitcoin-with-javascript/ bitcore 
// https://bcoin.io/ https://github.com/bcoin-org/bcoin#install bcoin.io 

// API for tx send and address utxo etc... https://github.com/Blockstream/esplora/blob/master/API.md#blocks
//      another API https://sochain.com/api/#send-transaction
// testnet faucet https://coinfaucet.eu/en/btc-testnet/
function parseAddress(encoded) {
    let decoded = base58.decode(encoded)
    console.log('decoded: ', bytesToHex(decoded))
    console.log('  version      4', bytesToHex(decoded.slice(0, 4)))
    console.log('  depth        1', bytesToHex(decoded.slice(4, 5)))
    console.log('  fingerprint  4', bytesToHex(decoded.slice(5, 9)))
    console.log('  childnumber  4', bytesToHex(decoded.slice(9, 13)))
    console.log('  chain       32', bytesToHex(decoded.slice(13, 45)))
    console.log('  pubkey      33', bytesToHex(decoded.slice(45, 78)))
    console.log('  checksum     4', bytesToHex(decoded.slice(78)))
}

async function getHDPrivateNodeFromSeed(seed) {
    // bip32 / bip44
    // https://en.bitcoin.it/wiki/BIP_0032#Serialization_format
    // https://iancoleman.io/bip39/ (39 is mnemonitic, but good tool)
    const crypto = {
        ripemd160: await instantiateRipemd160(),
        sha256: await instantiateSha256(),
        sha512: await instantiateSha512(),
        secp256k1: await instantiateSecp256k1(),
    }
    let node = deriveHdPrivateNodeFromSeed(crypto, seed)
    if(node) {
        console.log(bytesToHex(node.privateKey))
        console.log(bytesToHex(node.chainCode))
        console.log('depth: ', node.depth)
        console.log('childIndex: ', node.childIndex)
        let private_key_encoded = encodeHdPrivateKey(
            crypto, {node: node, network: 'mainnet'})
        console.log('pk encoded: ', private_key_encoded)
        console.log('pk decoded: ', 
            bytesToHex(base58.decode(private_key_encoded)))
        // child
        let child = deriveHdPath(crypto, node, "m/44'/0'/0'/0")
        let public_child_node = deriveHdPublicNode(crypto, child)
        let child_encoded = encodeHdPrivateKey(
            crypto, {node: child, network: 'mainnet'})
        console.log('child encoded: ', child_encoded)

        // further child
        let child_b = deriveHdPath(crypto, child, "m/0")
        let child_public_b = deriveHdPath(crypto, public_child_node, "M/1")

        let child_public = deriveHdPublicNode(crypto, child_b)
        let child_pub_encoded = encodeHdPublicKey(
            crypto, {node: child_public, network: 'mainnet'})
        console.log('encoded pub: ', child_pub_encoded)
        parseAddress(child_pub_encoded)
        let a = child_public.publicKey
        let b = child_public_b.publicKey
        console.log("m/44'/0'/0'/0/0", bytesToHex(a))
        console.log("m/44'/0'/0'/0/1", bytesToHex(b))
        console.log("m/44'/0'/0'/0/0", await base58CheckEncode(await p2pkh(a)))
        console.log("m/44'/0'/0'/0/1", await base58CheckEncode(await p2pkh(b)))
        // console.log(await p2pkh(a))
        // const redeem = bitcoin.payments.p2ms({ m: 2, pubKeys: [child_public_b.publicKey, child_public.publicKey] })
        // console.log(redeem)
    }
}

export default class WalletTest extends React.Component {
    words = 'super blast raven enforce favorite observe wave laptop broken dismiss chest just'
    seed = []
    vault = null
    constructor(props) {
        super(props)
        this.vault = props.vault
        console.log(this.vault.name)
    }
    componentDidMount() {
        // For testing, call function here for faster iteration
        // this.testSimple()
        // this.testHDWallet()
        // this.testP2MS()
        this.testBitcoinjs()
    }
    testBitcoinjs() {
        let words = 'parent warfare left snow vacuum lens transfer secret critic danger member prosper'
        let seed = bip39.mnemonicToSeedSync(words) // 64 bytes
        const root = bip32.fromSeed(seed)
        const private_key_encoded = root.toBase58();
        // const restored = bip32.fromBase58(strng);
        console.log('bitcoinjs: ', private_key_encoded)
        parseAddress(private_key_encoded)

        const derived = root.derivePath("m/84'/0'/0'/0")
        const child0 = derived.derive(0)
        const child1 = derived.derive(1)
        console.log('child0', bytesToHex(child0.publicKey))
        console.log('child1', bytesToHex(child1.publicKey))
        let n1 = new Node(child0)
        n1.debug()
        let n2 = new Node(child1.neutered())
        n2.debug()
    }
    testP2MS() {
        const pubkeys = [
            '02875e3da7c88b21c50628acab1d7b5956d71baeab9a32c09420f9c3b6029e5c3d',
            '03de126f745c0e45b98313602d2bc61ab9c62373b7d9ef4f84b267b4b92185a8c6'
        ].map(hex => Buffer.from(hex, 'hex'))
        const { address } = bitcoin.payments.p2wsh({
            redeem: bitcoin.payments.p2ms({ m: 2, pubkeys: pubkeys }),
        });
        console.log(address)
        let x = bitcoin.payments.p2ms({ m: 2, pubkeys })
        console.log(x)
    }
    testHDWallet() {
        (async () => {
            let words = 'parent warfare left snow vacuum lens transfer secret critic danger member prosper'
            let seed = bip39.mnemonicToSeedSync(words) // 64 bytes
            console.log('[WalletTest.hd] words: '+words)
            console.log('[WalletTest.hd] seed: '+bytesToHex(seed))
            let hd_wallet = getHDPrivateNodeFromSeed(seed)
        })()
    }
    testSimple() { 
        (async () => {
            let random_bytes = []
            let words = 'super blast raven enforce favorite observe wave laptop broken dismiss chest just'
            let seed = []
            const secp256k1 = await instantiateSecp256k1();
            do {
                random_bytes = await getRandom(32)
                // let words = bip39.entropyToMnemonic(bytesToHex(random_bytes)) // 12 words (11bits / word * 12 words = 132 - 4 checksum)
                // bitcoin book example Ch. 4 btc addresses, Base58Check Encoding
                // test 
                seed = bip39.mnemonicToSeedSync(words) // 64 bytes
                // https://libauth.org/interfaces/secp256k1.html#validateprivatekey
            } while(!secp256k1.validatePrivateKey(seed.slice(0, 32)))
            console.log('[WalletTest.test] words: '+words)
            console.log('[WalletTest.test] seed: '+bytesToHex(seed))
            // let pk = seed.slice(0, 32)

            // BOOK example
            console.log('#####################################\n# Mastering Bitcoin Chapter 4. pg69 #\n#####################################')
            let privateKey = hexToBytes('038109007313a5807b2eccc082c8c3fbb988a973cacf1a7df9ce725c31b14776')
            console.log('privateKey: ', bytesToHex(privateKey))
            let pubKey = secp256k1.derivePublicKeyCompressed(privateKey)
            console.log('pubKeyCompress ' + bytesToHex(pubKey))
            let abc = await p2pkh(pubKey)
            console.log('HASH160:     ', bytesToHex(abc))
            console.log('base58check: ', await base58CheckEncode(abc))
            // secp256k1.verifySignatureDERLowS(sig, pubkey, msgHash)
            //   ? console.log('🚀 Signature valid')
            //   : console.log('❌ Signature invalid');

        })();
    }
    testTestnetWallet() {
        let words = 'pupil rack target link minor comfort shoe ripple guilt mango banana sound'
        let seed = bip39.mnemonicToSeedSync(words) // 64 bytes
        const root = bip32.fromSeed(seed, bitcoin.networks.testnet)
        const private_key_encoded = root.toBase58();
        // const restored = bip32.fromBase58(strng);
        console.log('bitcoinjs: ', private_key_encoded)
        parseAddress(private_key_encoded)
        const derived = root.derivePath("m/84'/0'/0'")
        const child0 = derived.derive(0).derive(0)
        console.log(bytesToHex(child0.privateKey))
        let n1 = new Node(child0)
        n1.debug()
        console.log(bitcoin.networks.testnet)
        const addr = bitcoin.payments.p2wpkh({
            pubkey: child0.publicKey,
            network: bitcoin.networks.testnet,
        });
        console.log('testnet p2wpkh:', addr.address)
        // console.log('testnet pubkey hex:', bytesToHex(child0.publicKey)
    }
    makeDefaultWallets = () => {
        let wallets = []
        console.log('making default wallets for', this.vault.name)
        wallets[0] = this.vault.createWallet('Default - BTC', CoinTypes.BTC, NetworkTypes.MAINNET, PATH)
        wallets[1] = this.vault.createWallet('Testnet - BTC', CoinTypes.BTC, NetworkTypes.TESTNET, "m/44'/1'")
        wallets[0].save()
        wallets[1].save()
    }
    render() {
        return <View style={ds.mainContainer}>
            <Text style={ds.text2xl}>WalletTest</Text>
            <Pressable onPressOut={this.testSimple} style={[ds.button, ds.blueButton, tw`mb-3`]}>
                <Text  style={ds.text}>Simple Wallet</Text>
            </Pressable>
            <Pressable onPressOut={this.testHDWallet} style={[ds.button, ds.greenButton, tw`mb-3`]}>
                <Text style={ds.text}>HD Wallet</Text>
            </Pressable>
            <Pressable onPressOut={this.testP2MS} style={[ds.button, ds.redButton, tw`mb-3`]}>
                <Text style={ds.text}>P2MS</Text>
            </Pressable>
            <Pressable onPressOut={this.testBitcoinjs} style={[ds.button, ds.greenButton, tw`mb-3`]}>
                <Text style={ds.text}>Bitcoin JS</Text>
            </Pressable>
            <Pressable onPressOut={this.testTestnetWallet} style={[ds.button, ds.greenButton, tw`mb-3`]}>
                <Text style={ds.text}>Testnet Wallet</Text>
            </Pressable>
            <Pressable onPressOut={this.makeDefaultWallets} style={[ds.button, ds.grayButton, tw`mb-3`]}>
                <Text style={ds.text}>Make Default Wallets for Vault</Text>
            </Pressable>
        </View>
    }
}


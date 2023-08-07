import * as assert from 'assert'
import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import tw from '../../lib/tailwind'
import ds from '../../assets/styles'

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

const seed_phrases = [
    'super blast raven enforce favorite observe wave laptop broken dismiss chest just',
    'more giraffe rhythm alley inspire allow chat mountain rose panther deny property',
    'doll sell give donate mushroom roast climb tuition mad bag pair step',
]

import four_users from '../../testdata/01_four_users'
import Vault from '../../classes/Vault'
import SmartWallet from '../../classes/SmartWallet'
import Participant from '../../classes/Participant'

import { WalletTemplateTypes } from '../../classes/WalletTemplates'
import Signer from '../../classes/Signer'


async function testytest() {
    let UserVaults = {}
    const usernames = Object.keys(four_users)
    await usernames.map(k => {
        let tmp = JSON.parse(four_users[k][
            Object.keys(four_users[k]).filter(x => x.startsWith('v_'))[0]
        ])
        UserVaults[k] = new Vault()
        UserVaults[k].fromDict(tmp)
    })
    
    console.log(usernames)
    let v_alice = UserVaults['alice']
    let v_bobby = UserVaults['bobby']
    let v_miketery = UserVaults['miketery']
    let v_charlotte = UserVaults['charlotte']
    let sw = SmartWallet.create(v_miketery,
        'Simple Multisig 2 of 3',
        'smart',
        'testnet',
        'BTC',
        WalletTemplateTypes.BASIC_MULTISIG
    )
    let v1, v2, v3, v4
    let s1, s2, s3, s4
    let p1, p2, p3, p4
    v1 = v_alice
    s1 = await Signer.create(v1, sw)
    p1 = new Participant(v1.verify_key, s1.publicKey, [], 'alice')
    sw.addParticipant(p1)

    v2 = v_bobby
    s2 = await Signer.create(v2, sw)
    p2 = new Participant(v2.verify_key, s2.publicKey, [], 'bobby')
    sw.addParticipant(p2)

    v3 = v_charlotte
    s3 = await Signer.create(v3, sw)
    p3 = new Participant(v3.verify_key, s3.publicKey, [], 'charlotte')
    sw.addParticipant(p3)

    v4 = v_miketery
    s4 = await Signer.create(v4, sw)
    p4 = new Participant(v4.verify_key, s4.publicKey, [], 'miketery')
    sw.addParticipant(p4)

    console.log('Number of participants:', sw.participants.length)
    sw.removeParticipant(p3.verify_key)
    console.log('Number of participants:', sw.participants.length)
    console.log('Bobby:', sw.getParticipant(
        hexToBytes(bytesToHex(v_bobby.verify_key))))

    sw.finalize()
    const x = bitcoin.payments.p2wsh({output: sw.node.output, network: sw.network})
    console.log(x.address, bytesToHex(x.output), bytesToHex(x.hash))
    console.log(x)

    const y = bitcoin.payments.p2wsh({hash: sw.node.script_hash, network: sw.network})
    console.log(y.address, bytesToHex(y.output), bytesToHex(y.hash))
    console.log(y)

    const z = bitcoin.payments.p2wsh({redeem: {output: sw.node.script, network: sw.network}})
    console.log(z.address, bytesToHex(z.output), bytesToHex(z.hash))
    console.log(z)

    console.log(sw.address)
    console.log(bytesToHex(sw.script))
}


export default class WalletTest extends React.Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        // setup vaults for users
        // console.log(UserVaults)
        testytest()
    }
    async testSmartWallet() {
       
    }
    genSeed = async () => {
        let random_bytes = []
        let words = ''
        let seed = []
        do {
            random_bytes = await getRandom(16)
            words = bip39.entropyToMnemonic(bytesToHex(random_bytes))
            console.log(words)
            seed = bip39.mnemonicToSeedSync(words) // 64 bytes
            // https://libauth.org/interfaces/secp256k1.html#validateprivatekey
        } while(!ecc.isPrivate(seed.slice(0, 32)))
        return {seed: seed, words: words}
    }
    testMSExample = () => {
        // https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/addresses.spec.ts#L45
        const pubkeys = [
            '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
            '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
            '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
        ].map(hex => Buffer.from(hex, 'hex'));
        const p2sh = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2ms({ m: 2, pubkeys }),
        });
        assert.strictEqual(p2sh.address, '36NUkt6FWUi3LAWBqWRdDmdTWbt91Yvfu7');
        console.log(p2sh.address)
        console.log(p2sh)
        console.log(bytesToHex(p2sh.redeem.output))
        console.log(bytesToHex(p2sh.hash))
    }
    testSimple = async () => { 
        let seeds = []
        let public_keys = []
        seed_phrases.forEach((phrase, i) => {
            seeds[i] = bip39.mnemonicToSeedSync(phrase)
            if(!ecc.isPrivate(seeds[i].slice(0, 32)))
                console.log('invalid seed')
            public_keys[i] = ecc.pointFromScalar(seeds[i].slice(0, 32))
        })
        public_keys.map((public_key, i) => {
            console.log(`${i}: ${bytesToHex(public_key)}`)
        })

    }
    render() {
        return <View style={ds.mainContainerPt}>
            <Text style={ds.text2xl}>WalletTest</Text>
            <ScrollView>
                <Pressable onPressOut={this.testSmartWallet} style={[buttonStyle, ds.blueButton]}>
                    <Text style={ds.text}>Smart Wallet</Text>
                </Pressable>
                <Pressable onPressOut={this.genSeed} style={[buttonStyle, ds.blueButton]}>
                    <Text style={ds.text}>Gen Seed</Text>
                </Pressable>
                
                <Pressable onPressOut={this.testSimple} style={[buttonStyle, ds.blueButton]}>
                    <Text style={ds.text}>Simple Test Wallet</Text>
                </Pressable>
                <Pressable onPressOut={this.testMSExample} style={[buttonStyle, ds.blueButton]}>
                    <Text style={ds.text}>2 of 3 Multisig example</Text>
                </Pressable>
            </ScrollView>
        </View>
    }
}

const buttonStyle = [ds.button, tw`w-full py-4 mb-2`]


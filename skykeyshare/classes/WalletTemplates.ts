import { Network } from "bitcoinjs-lib"
import { Participant } from "./SmartWallet"

const bitcoin = require('bitcoinjs-lib')

interface WalletTemplate {
    display: string
    name: string
    logic: string
    description: string
    enabled: boolean
    hidden?: boolean
    participant_range: [number, number]
    inputs: any[]
    create: any
}

const BASIC_MULTISIG: WalletTemplate = {
    display: 'T of N\nMultisig',
    name: 'BASIC_MULTISIG',
    logic: '{T-of-N}',
    description: 
        'A number (N) parties share a wallet. A threshold (T) ' +
        ' of signatures is required to spend from the wallet.' +
        '\n\nUse it for Money Pools, Partnerships, Escrow etc.',
    enabled: true,
    participant_range: [2, 12],
    inputs: [
        {
            name: 'threshold',
            type: 'number',
            display: 'Threshold',
            description: 'Number of required signatures',
            default: 2,
            min: 1,
            max: 12,
            user_input: true,
            errorChecking: (opts: {threshold: number}, participants: Array<Participant>) => {
                let errors = []
                if (!('threshold' in opts))
                    errors.push('Threshold is required')
                if (opts.threshold > participants.length)
                    errors.push('Threshold must be less than or equal to number of participants: ' + participants.length)
                if (opts.threshold < 1)
                    errors.push('Threshold must be greater than 0')
                return errors
            }
        },
        {
            name: 'participants',
            // N implied from participants.length
            type: 'Array<Participant>',
            description: 'Participants',
            user_input: false,
        },
        {
            name: 'network',
            type: 'Network',
            description: 'network',
            user_input: false,
            default: bitcoin.networks.bitcoin,
        }
    ],
    create: (t: number, participants: Array<Participant>, network: Network) => {
        const p2ms =  bitcoin.payments.p2ms({
            m: t,
            pubkeys: participants.map(p => p.publicKey),
            network: network,
        })
        const p2wsh = bitcoin.payments.p2wsh({
            redeem: p2ms,
            network: network,
        })
        return p2wsh
    }
}

const TIMED_TRUST = { // DEADMAN_TRUST
    display: 'Time Locked\nEstate Wallet',
    name: 'TIMED_TRUST',
    logic: '{YOU} OR ( {TIME} AND {T-of-N} )',
    description:
        'Funds are only accessible to you until a future specified time. ' +
        'If not rolled to a new Wallet with your signature, ' +
        'funds are then also accesible to trusted parties (T of N).',
    enabled: false,
    hidden: false,
}
const LESS_WITH_TIME = {
    display: 'Ease Threshold\nWith Time',
    name: 'LESS_WITH_TIME',
    logic: '{T1-of-N1} OR ( {TIME} AND {T2-of-N2} )',
    description:
        'Funds are only accessible to you until a future specified time. ' +
        'If not rolled to a new Wallet with your signature, ' +
        'funds are then also accesible to trusted parties (T of N).',
    enabled: false,
    hidden: false,
}

const WalletTemplates: Object = {
    BASIC_MULTISIG: BASIC_MULTISIG,
    TIMED_TRUST: TIMED_TRUST,
    LESS_WITH_TIME: LESS_WITH_TIME,
    // for simulating scroll
    // EXTRA_A: BASIC_MULTISIG,
    // EXTRA_B: BASIC_MULTISIG,
    // EXTRA_C: BASIC_MULTISIG,
    // EXTRA_D: BASIC_MULTISIG,
}
export enum WalletTemplateTypes {
    BASIC_MULTISIG = 'BASIC_MULTISIG',
    TIMED_TRUST = 'TIMED_TRUST',
    LESS_WITH_TIME = 'LESS_WITH_TIME',
}

export default WalletTemplates
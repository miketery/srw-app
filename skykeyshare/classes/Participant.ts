import base58 from 'bs58'
import { bytesToHex, hexToBytes, joinByteArrays, verify_msg } from '../lib/utils'

import Vault from './Vault'
import Contact from './Contact'
import { MessageOut } from './Message'


export enum ParticipantStates {
    DRAFT = 'draft',
    PENDING = 'pending', //invite sent
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    UNINFORMED = 'uninformed',  // if participant doesnt know
    CUSTOM = 'custom',  // if we paste custom public key from other source (wont have identiy then)
}
export enum ParticipantRoles {
    SIGNER = 'signer',
    OWNER = 'owner',
    EDITOR = 'editor',
    VIEWER = 'viewer',
}

export default class Participant {
    private _verify_key: Uint8Array  // ed25519.PublicKey (pk)
    publicKeys: {
        publicKey: Uint8Array, // secp256k1.PublicKey for BTC
        signature: Uint8Array  // ed25519 siganature of publicKey
    }[]
    // username: string
    name: string
    role: ParticipantRoles
    state: ParticipantStates
    // optional
    phoneNumber: string
    email: string
    // description: string
    constructor(verify_key: Uint8Array,
        publicKeys: {publicKey: Uint8Array, signature: Uint8Array}[],
        name: string,
        role: ParticipantRoles=ParticipantRoles.SIGNER,
        state: ParticipantStates=ParticipantStates.DRAFT) {
        this._verify_key = verify_key
        this.publicKeys = publicKeys
        this.name = name
        this.role = role
        this.state = state
    }
    static fromDict(json: any): Participant {
        if(!('publicKeys' in json))
            json.publicKeys = []
        return new Participant(
            base58.decode(json.verify_key),
            json.publicKeys.map(x => ({
                publicKey: base58.decode(x.publicKey),
                signature: hexToBytes(x.signature)})),
            json.name,
            json.role,
            json.state,
        )
    }
    toDict(): any {
        return {
            verify_key: base58.encode(this.verify_key),
            publicKeys: this.publicKeys.map(x => ({
                publicKey: base58.encode(x.publicKey),
                signature: bytesToHex(x.signature)})),
            name: this.name,
            role: this.role,
            state: this.state,
        }
    }
    get isSigner(): boolean {
        return this.role === ParticipantRoles.SIGNER
    }
    get isOwner(): boolean {
        return this.role === ParticipantRoles.OWNER
    }
    get verify_key(): Uint8Array {
        return this._verify_key
    }
    get verify_key_base58(): string {
        return base58.encode(this.verify_key)
    }
    async getContact(): Promise<Contact> {
        return Contact.getByVerifyKey(this.verify_key_base58)
    }
    isMe(vault: Vault): boolean {
        return this.verify_key_base58 === vault.verifyKeyBase58()
    }
    addKey(publicKey: Uint8Array, signature: Uint8Array): Boolean {
        const exist = this.publicKeys.find(x => bytesToHex(x.publicKey) === bytesToHex(publicKey))
        if(exist) {
            console.log('Already exists, no need to add')
            return true // already exists no need to add
        }
        try {
            const verified = verify_msg(
                joinByteArrays(signature, publicKey), this.verify_key)
            if(bytesToHex(verified) === bytesToHex(publicKey)) {
                this.publicKeys.push({
                    publicKey: publicKey,
                    signature: signature
                })
                // TODO: push to server.
                this.state = ParticipantStates.ACCEPTED
                return true
            }
        } catch (e) {
            console.log('[Participant.addKey] error', e)
            return false
        }
        return false
    }
    // ################################################################
    // NOTIFICATIONS
    async sendInvite(payload: any, vault: Vault): Promise<Boolean> {
        console.log(vault.pk, this.verify_key_base58)
        const contact = await this.getContact()
        const data = {
            payload: payload,
            type_name: 'wallet_invite',
        }
        const m = new MessageOut(data, contact)
        return m.send(vault).then(response => {
            if(response['status'] == 201) {
                this.state = ParticipantStates.PENDING
                return true
            }
            return false
        })
    }
    // ################################################################
}
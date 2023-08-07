import axios from "axios"
import base58 from "bs58"
import binaryToBase64 from "react-native/Libraries/Utilities/binaryToBase64"
import { bytesToHex, sealed_box, box } from "../lib/utils"
import { MESSAGE_POST_ENDPOINT } from '../config'

export class MessageOut {
    type_name = ''
    type_version = '0.1'
    encrypted = null // payload
    public_key = null // to which public key
    verify_key = null // to which verify_key

    constructor(data, contact) {
        console.log('[MessageOut.constructor]', data)
        this.private_key = contact.private_key
        this.public_key = contact.their_public_key
        this.verify_key = contact.their_verify_key

        const encoder = new TextEncoder()
        this.type_name = data.type_name
        let encoded = encoder.encode(JSON.stringify(data))
        this.encrypted = box(encoded, this.public_key, this.private_key)
    }
    async send(vault) {
        console.log('[Message.send] '+bytesToHex(this.verify_key))
        const payload = {
            type_name: this.type_name,
            type_version: this.type_version,
            public_key: base58.encode(this.public_key),
            verify_key: base58.encode(this.verify_key),
            data: binaryToBase64(this.encrypted),
        }
        const signed_payload = vault.createSignedPayload(payload)
        return axios.post(MESSAGE_POST_ENDPOINT, signed_payload)
    }
}
export class KeyShareMessage extends MessageOut {
    name = 'keyshare_init'
    version = '0.1'
}
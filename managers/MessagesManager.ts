/*
    Need to interface with DAS for messages outbound and inbound
    - outbound: create message, encrypt, send to DAS
    - inbound: receive message from DAS, decrypt, process

    Need to keep track of last received, and IDs that have received
    - last received: used to get messages since last received
    - IDs that have received: used to make sure not duplicated


*/

import DigitalAgentService from "../services/DigitalAgentService";
import { Message } from "../models/Message";
import SS, { StoredTypePrefix } from "../services/StorageService";
import Vault from "../models/Vault";

interface LastReceivedStateDict {
    uuid: string;
    timestamp: number;
}

class InboundMessageManager {
    private _vault: Vault;
    private _inbound_messages: {string? : Message};
    private _last: LastReceivedStateDict;
 
    constructor(vault: Vault, last?: LastReceivedStateDict) {
        this._vault = vault;
        this._inbound_messages = {};
        if(last)
            this._last = last;
        else
            this._last = {
                uuid: '',
                timestamp: 0
            }
    }
    async getMessages() {
        const messages = await DigitalAgentService.getMessages(this._vault, this._last.timestamp)
        if(!messages)
            return false
        console.log('[InboundManager.getMessages]', messages.length)
        if(messages.length > 0){
            this._last = {
                'timestamp': messages[0]['created'],
                'uuid': messages[0]['uuid']
            }
        }
        const promises: Promise<void>[] = []
        for(let message of messages){
            const msg = Message.inbound(message)
            promises.push(this.saveMessage(msg))
            this._inbound_messages[msg.pk] = msg
        }
        return messages.length
    }
    async saveMessage(message: Message): Promise<void> {
        return SS.save(message.pk, message.toDict())
    }
    // async processInboundAndPass() {

    // }
}

export default InboundMessageManager;
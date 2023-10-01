/*
    Need to interface with DAS for messages outbound and inbound
    - outbound: create message, encrypt, send to DAS
    - inbound: receive message from DAS, decrypt, process

    Need to keep track of last received, and IDs that have received
    - last received: used to get messages since last received
    - IDs that have received: used to make sure not duplicated


*/

import DigitalAgentService from "../services/DigitalAgentService";
import { InboundMessageDict, Message } from "../models/Message";
import SS, { StoredType, StoredTypePrefix } from "../services/StorageService";
import Vault from "../models/Vault";
import { getContactsManager, getNotificationsManager } from "../services/Cache";
import Contact from "../models/Contact";
import Notification, { NotificationTypes } from "../models/Notification";

type processMapType = {
    [key: string]: (message: Message, vault: Vault) => Promise<boolean>
}

const processMap: processMapType = {
    'app.test': (message: Message, vault: Vault) => {
        console.log('[processMap] app.test', message)
        const notification = getNotificationsManager()!.createNotification(
            NotificationTypes.app.alert, {
                // message: message.data,
                timestamp: message.created
            })
        // TODO: return true or false so knows whether to delete original message
        return Promise.resolve(true)
    },
    // 'contact.request': async (message: InboundMessageDict, vault: Vault) => {
    //     const contact: Contact = await getContactsManager()!.processContactRequest(message)
    //     const notification = Notification.create(vault.pk,
    //         NotificationTypes.contact.request, {
    //             name: contact.name,
    //             did: contact.did,
    //             timestamp: message.created
    //         })
    //     getNotificationsManager()!.addNotification(notification)
    // },
    // 'contact_accept': (message: InboundMessageDict) => {
    //     getContactsManager()!.processAcceptContactRequestResponse(message)
    // }
}


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
        for(const message of messages){
            const msg = Message.inbound(message)
            promises.push(this.saveMessage(msg))
            this._inbound_messages[msg.pk] = msg
        }
        return messages.length
    }
    async saveMessage(message: Message): Promise<void> {
        return SS.save(message.pk, message.toDict())
    }
    async loadMessages(): Promise<{string?: Message}> {
        const messages: {string?: Message} = {};
        const messages_data = await SS.getAll(StoredType.message, this._vault.pk);
        for (let message_data of Object.values(messages_data)) {
            const m = Message.fromDict(message_data);
            messages[m.pk] = m;
        }
        this._inbound_messages = messages;
        return messages;
    }
    async deleteMessage(message: Message): Promise<void> {
        await SS.delete(message.pk);
        delete this._inbound_messages[message.pk];
    }
    getMessagesAsArray(): Message[] {
        return Object.values(this._inbound_messages).sort((a, b) => a.created - b.created)
    }
    async processMessage(message: Message): Promise<boolean> {
        console.log('[InboundMessageManager.processMessage]', message)
        if(!Object.keys(processMap).includes(message.type_name))
            throw new Error('Message type not supported') // do we discard / delete?
        return await processMap[message.type_name](message, this._vault)
    }
    async processAllMessages(): Promise<Promise<boolean>[]> {
        const messages = this.getMessagesAsArray()
        const promises: Promise<boolean>[] = []
        for(const message of messages){
            promises.push(this.processMessage(message))
        }
        return promises
    }
}

export default InboundMessageManager;
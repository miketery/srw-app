/*
    Need to interface with DAS for messages outbound and inbound
    - outbound: create message, encrypt, send to DAS
    - inbound: receive message from DAS, decrypt, process

    Need to keep track of last received, and IDs that have received
    - last received: used to get messages since last received
    - IDs that have received: used to make sure not duplicated


*/
import DigitalAgentService from "../services/DigitalAgentService";
import { Message, OutboundMessageDict, InboundMessageDict } from "../models/Message";
import SS, { StoredType } from "../services/StorageService";
import Vault from "../models/Vault";
import { NotificationData, NotificationTypes } from "../models/Notification";
import VaultManager from "./VaultManager";

type processMapType = {
    [key: string]: (message: Message, vault: Vault, m: VaultManager) => Promise<boolean>
}

export const MessageTypes = {
    'contact': {
        'request': 'msg.contact.request',
        'accept': 'msg.contact.accept'
    },
    'app': {
        'test': 'msg.app.test',
        'info': 'msg.app.info',
        'alert': 'msg.app.alert',
        'warning': 'msg.app.warning',
    },
    'recovery': {
        'request': 'msg.recovery.request',
        'accept': 'msg.recovery.accept'
    },
}

const processMap: processMapType = {
    [MessageTypes.app.test]: (message: Message, vault: Vault, m: VaultManager) => {
        console.log('[processMap] app.test', message)
        message.decrypt(vault.private_key)
        const notification = m.notificationsManager.createNotification(
            NotificationTypes.app.alert, {
                title: 'App.Test Message',
                short_text: message.getData().message,
                long_text: message.getData().message,
                icon: 'info',
                metadata: {
                    timestamp: message.created
                }
            } as NotificationData)
        return Promise.resolve(true)
    },
    [MessageTypes.contact.request]: async (message: Message, vault: Vault, m: VaultManager) => {
        console.log('[processMap] ', message.type_name, message)
        const contact = await m.contactsManager.processContactRequest(message)
        const notification = m.notificationsManager.createNotification(
            NotificationTypes.contact.request, {
                title: 'Contact Request',
                short_text: contact.name + ' wants to connect',
                detailed_text: contact.name + ' accepted your request',
                metadata: {
                    timestamp: message.created,
                    did: contact.did // will be used in notificationActionsMap by contactsManager
                }
            })
        return Promise.resolve(true)
    },
    [MessageTypes.contact.accept]: async (message: Message, vault: Vault, m: VaultManager) => {
        console.log('[processMap] ', message.type_name, message)
        const contact = await m.contactsManager.processContactAccept(message)
        const notification = m.notificationsManager.createNotification(
            NotificationTypes.contact.accept, {
                title: 'Contact Accepted',
                short_text: contact.name + ' accepted your request',
                detailed_text: contact.name + ' accepted your request',
                metadata: {
                    timestamp: message.created
                }
            })
        return Promise.resolve(true)
    },
}


interface LastReceivedStateDict {
    uuid: string;
    timestamp: number;
}

class InboundMessageManager {
    private _vault: Vault;
    private _manager: VaultManager;
    private _inbound_messages: {string? : Message};
    private _last: LastReceivedStateDict;
    private _getMessages: () => Promise<OutboundMessageDict[]>;
 
    constructor(vault: Vault, manager: VaultManager, last?: LastReceivedStateDict) {
        this._vault = vault;
        this._manager = manager;
        this._inbound_messages = {};
        this._getMessages = DigitalAgentService.getGetMessagesFunction(vault);
        if(last)
            this._last = last;
        else
            this._last = {
                uuid: '',
                timestamp: 0
            }
    }
    startFetchInterval(interval = 1500): any {
        return setInterval(this.getMessages, interval);
    }
    getMessages = async () => {
        const messages = await this._getMessages()
        messages.forEach(async (message) => {
            const msg = Message.inbound(message as InboundMessageDict)
            await this.saveMessage(msg)
            this.processMessage(msg)
        })
        // const messages = await DigitalAgentService.getMessages(this._vault, this._last.timestamp)
        // if(!messages)
        //     return false
        // console.log('[InboundManager.getMessages]', messages.length)
        // if(messages.length > 0){
        //     this._last = {
        //         'timestamp': messages[0]['created'],
        //         'uuid': messages[0]['uuid']
        //     }
        // }
        // const promises: Promise<void>[] = []
        // for(const message of messages){
        //     const msg = Message.inbound(message)
        //     promises.push(this.saveMessage(msg))
        //     this._inbound_messages[msg.pk] = msg
        // }
        // return messages.length
    }
    async saveMessage(message: Message): Promise<void> {
        this._inbound_messages[message.pk] = message
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
        this.processAllMessages()
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
        const res = await processMap[message.type_name](message, this._vault, this._manager)
        if(res)
            await this.deleteMessage(message)
        return res
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
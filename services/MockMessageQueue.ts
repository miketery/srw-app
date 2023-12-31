import { OutboundMessageDict } from "../models/Message";

const Messages: { [key: string]: OutboundMessageDict[] } = {}

const MockMessageQueue = {
    sendMessage: (message: OutboundMessageDict) => {
        console.log('[MockMessageQueue.sendMessage]', message)
        if (!Messages[message.receiver.did])
            Messages[message.receiver.did] = []
        Messages[message.receiver.did].push(message)
        return true
    },
    fetchMessages: (did: string): OutboundMessageDict[] => {
        console.log('[MockMessageQueue.fetchMessages]', did)
        if (!Messages[did])
            return []
        const response = Messages[did]
        Messages[did] = []
        return response
    },
}

export default MockMessageQueue
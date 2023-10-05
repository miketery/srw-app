import { OutboundMessageDict } from "../models/Message";

const Messages: { [key: string]: OutboundMessageDict[] } = {}

const MockMessageQueue = {
    postMessage: (message: OutboundMessageDict) => {
        console.log('[MockMessageQueue.postMessage]', message)
        if (!Messages[message.receiver.did])
            Messages[message.receiver.did] = []
        Messages[message.receiver.did].push(message)
        return true
    },
    getMessages: (did: string): OutboundMessageDict[] => {
        console.log('[MockMessageQueue.getMessages]', did)
        if (!Messages[did])
            return []
        const response = Messages[did]
        Messages[did] = []
        return response
    },
}

export default MockMessageQueue
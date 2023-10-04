import axios from 'axios';

import Vault from '../models/Vault';
import { BASE, DEBUG, ENDPOINTS, MOCK } from '../config';
import { OutboundMessageDict } from '../models/Message';
// import Contact from './Contact';
import MockMessageQueue from './MockMessageQueue';

class DigitalAgentService {
    static digital_agent_host: string = BASE;

    static async registerVault(vault: Vault): Promise<{}|false> {
        const payload = {
            'name': vault.name,
            'display_name': vault.display_name,
            'email': vault.email,
            // 'phone': vault.phone,
            // 'localtion': vault.location,
            'verify_key': vault.b58_verify_key,
            'public_key': vault.b58_public_key,
            'public_key_signature': Buffer.from(vault.sign(vault.public_key)).subarray(0, 64).toString('hex'),
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.REGISTER, signed_payload)
        .catch((error) => {
            console.log(error)
            if('response' in error && error.response.status == 409)
                console.log('[DigitalAgentService.registerVault] Already registered')
            return false
        });
        if(!response)
            return false
        console.log('[registerVault]', response)
        if (response['status'] == 201) {
            return response['data'];
        } else {
            return false
        }
    }
    static async amIRegistered(vault: Vault): Promise<{}|false> {
        const payload = {
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.ME, signed_payload)
        .catch((error) => {
            console.log(error)
            return false
        });
        if(!response)
            return false
        console.log('[amIRegistered]', response)
        if (response['status'] == 200) {
            return response['data'];
        } else {
            return false
        }
    }
    static async postMessage(vault: Vault, message: any): Promise<any> {
        const signed_payload = vault.signPayload(message);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.POST_MESSAGE, signed_payload)
        .catch((error) => {
            console.log('[DigitalAgentService.postMessage]', error)
            throw new Error(error);
        });
        if(!response)
            return false
        console.log('[postMessage]', response)
        if (response['status'] == 200) {
            return response['data'];
        }
    }
    static getPostMessageFunction(vault: Vault): (message: OutboundMessageDict) => Promise<any> {
        return async (message: OutboundMessageDict) => {
            if(MOCK)
                MockMessageQueue.postMessage(message)
            else
                return await this.postMessage(vault, message)
        }
    }
    static getGetMessagesFunction(vault: Vault): (after?: number) => Promise<OutboundMessageDict[]> {
        return async (after?: number) => {
            if(MOCK)
                return MockMessageQueue.getMessages(vault.did)
            else
                return await this.getMessages(vault, after)
        }
    }
    static async getMessages(vault: Vault, after?: number): Promise<any> {
        const payload = {
            'after': after,
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.GET_MESSAGES, signed_payload)
        .catch((error) => {
            console.log('[DigitalAgentService.getMessages]', error)
            throw new Error(error);
        });
        if(!response)
            return false
        DEBUG && console.log('[getMessages]', response)
        if (response['status'] == 200) {
            return response['data'];
        }
    }
    // static async msgForContact(
    //         vault: Vault,
    //         contact: Contact,
    //         msg: {
    //             type_name: string,
    //             type_version: string,
    //             app_name: string,
    //             data: any
            
    //         }){
    //     const payload = {
    //         'msg': msg,
    //         'sig_ts': Math.floor(Date.now() / 1000)
    //     }
    //     const signed_payload = vault.signPayload(payload);
    //     let data = await axios.post(this.digital_agent_host + ENDPOINTS.ME, signed_payload).catch(
    //         (error) => {
    //             console.log(error)
    //             throw new Error(error);
    //         }
    //     );
    //     console.log(data)
    //     if (data['status'] == 200) {
    //         return data['data'];
    //     } else {
    //         throw new Error(data['message']);
    //     }
    // }


    // static async signPayload(vault, data, msg_type) {
    //     const payload = {
    //         'msg_type': msg_type,
    //         'data': data,
    //         'sig_ts': Math.floor(Date.now() / 1000)
    //     }
    //     const signed_payload = vault.signPayload(payload);
    //     return signed_payload;
    // }
}

export default DigitalAgentService;
import axios from 'axios';

import { BASE, DEBUG, ENDPOINTS, MOCK } from '../config';
import Vault from '../models/Vault';
import MockMessageQueue from './MockMessageQueue';
import { OutboundMessageDict } from '../models/Message';

export type SenderFunction = (message: OutboundMessageDict) => Promise<any>;
export type FetchMessagesFunction = (after?: number) => Promise<OutboundMessageDict[]>;

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
    static async sendMessage(vault: Vault, message: any): Promise<any> {
        const signed_payload = vault.signPayload(message);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.POST_MESSAGE, signed_payload)
        .catch((error) => {
            console.log('[DigitalAgentService.sendMessage]', error)
            throw new Error(error);
        });
        if(!response)
            return false
        console.log('[sendMessage]', response)
        if ([200, 201].includes(response['status'])) {
            return response['data'];
        }
    }
    static getSendMessageFunction(vault: Vault): SenderFunction {
        return async (message: OutboundMessageDict) => {
            if(MOCK)
                return MockMessageQueue.sendMessage(message)
            else
                return await this.sendMessage(vault, message)
        }
    }
    static getFetchMessagesFunction(vault: Vault): FetchMessagesFunction {
        return async (after?: number) => {
            if(MOCK)
                return MockMessageQueue.fetchMessages(vault.did)
            else
                return await this.fetchMessages(vault, after)
        }
    }
    static async fetchMessages(vault: Vault, after?: number): Promise<any> {
        const payload = {
            'after': after,
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.GET_MESSAGES, signed_payload)
        .catch((error) => {
            console.log('[DigitalAgentService.fetchMessages]', error)
            throw new Error(error);
        });
        if(!response)
            return false
        DEBUG && console.log('[fetchMessages]', response)
        if (response['status'] == 200) {
            return response['data'];
        }
    }
    static async contactLookUp(vault: Vault, shortCodeOrDid: string): Promise<{
            found: boolean,
            error?: any,
            data?: {}}> {
        // TODO: fix logic and return object...
        const payload = {
            'short_code_or_did': shortCodeOrDid,
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.CONTACT_LOOKUP, signed_payload)
        .catch((error) => {
            console.log('[DigitalAgentService.contactLookUp]', error)
            if('response' in error && error.response.status == 404)
                console.log('[DigitalAgentService.contactLookUp] not found')
            return error
        });
        console.log(response)
        if(response && response['status'] == 200) {
            return {
                found: true,
                data: response['data']
            }
        } else if(response && response.request.status == 404) {
            return {
                found: false,
            }
        } else if(response.code == 'ERR_NETWORK') {
            return {
                found: false,
                error: 'Network error'
            }
        } else { 
            return {
                found: false,
                error: 'Unknown error'
            }
        }
    }
    static async getBackupManifest(vault: Vault): Promise<false|string[]> {
        const payload = {
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.GET_BACKUP_MANIFEST, signed_payload)
        .catch((error) => {
            console.log('[DigitalAgentService.getFileManifest]', error)
            throw new Error(error);
        });
        if(!response)
            return false
        console.log('[getFileManifest]', response)
        if (response['status'] == 200) {
            return response['data'];
        }
    }
    static async uploadObjects(vault: Vault, objects: object[]) {
        console.log(objects)
        const payload = {
            'objects': objects,
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.UPLOAD_FILES, signed_payload)
        .catch((error) => {
            console.log('[DigitalAgentService.uploadFiles]', error)
            throw new Error(error);
        });
        if(!response)
            return false
        console.log('[uploadFiles]', response)
        if (response['status'] == 202) {
            return response['data'];
        }
    }
    static async getObjects(vault: Vault, pks: string[]) {
        const payload = {
            'pks': pks,
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        const response = await axios.post(this.digital_agent_host + ENDPOINTS.GET_FILES, signed_payload)
        .catch((error) => {
            console.log('[DigitalAgentService.getFiles]', error)
            throw new Error(error);
        });
        if(!response)
            return false
        console.log('[getFiles]', response)
        if (response['status'] == 200) {
            return response['data'];
        }
    }
}

export default DigitalAgentService;
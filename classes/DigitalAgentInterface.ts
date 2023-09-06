import axios from 'axios';

import Vault from './Vault';
import { BASE, ENDPOINTS } from '../config';
// import Contact from './Contact';


class DigitalAgentInterface {
    static digital_agent_host: string = BASE;

    constructor(vault: Vault) {
        DigitalAgentInterface.digital_agent_host = BASE; // vault.digital_agent_host;
    }
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
                console.log('[DigitalAgentInterface.registerVault] Already registered')
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

export default DigitalAgentInterface;
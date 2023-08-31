import axios from 'axios';

import Vault from './Vault';
import { BASE, ENDPOINTS } from '../config';


class DigitalAgentInterface {
    static digital_agent_host: string = BASE

/*
name
display name
location
email
phone
verify_key
public_key

*/


    static async registerVault(vault: Vault) {
        const payload = {
            'name': vault.name,
            'display_name': vault.display_name,
            'email': vault.email,
            'verify_key': vault.b58_verify_key,
            'public_key': vault.b58_public_key,
            'public_key_signature': Buffer.from(vault.sign(vault.public_key)).subarray(0, 64).toString('hex'),
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        let data = await axios.post(this.digital_agent_host + ENDPOINTS.REGISTER, signed_payload).catch(
            (error) => {
                console.log(error)
                throw new Error(error);
            }
        );
        if (data['status'] == 201) {
            return data['data'];
        } else {
            throw new Error(data['message']);
        }
    }
    static async amIRegistered(vault: Vault) {
        const payload = {
            'sig_ts': Math.floor(Date.now() / 1000)
        }
        const signed_payload = vault.signPayload(payload);
        let data = await axios.post(this.digital_agent_host + ENDPOINTS.ME, signed_payload).catch(
            (error) => {
                console.log(error)
                throw new Error(error);
            }
        );
        console.log(data)
        if (data['status'] == 200) {
            return data['data'];
        } else {
            throw new Error(data['message']);
        }
    }
}

export default DigitalAgentInterface;
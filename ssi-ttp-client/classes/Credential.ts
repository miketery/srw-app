import axios from 'axios'
import { ENDPOINTS } from '../config'


interface CredentialData {
    // needs to match core.models.Credential
    uuid: string;
    name: string;
    issuer: string;
    issuer_name: string;
    holder: string;
    holder_name: string;
    issue_date: string;
    not_before: string;
    not_after: string;
    template: string;
    data: any;
}

export enum CredentialState {
    // to match core.models.CredentialState
    ISSUED = 'issued',
    REJECTED = 'rejected',
    REVOKED = 'revoked',
    PENDING = 'pending',
}

export default class Credential {
    private static cache: Map<string, CredentialData> = new Map();

    constructor() {}

    static async get(uuid: string, forceFetch: boolean = false): Promise<CredentialData> {
        console.log('[Credential.get] ' + uuid)
        if (!forceFetch && Credential.cache.has(uuid)) {
            return Credential.cache.get(uuid)!;
        }
        return axios.get(ENDPOINTS.credential(uuid))
            .then((response) => {
                Credential.cache.set(uuid, response.data);
                return response.data
            }).catch((error) => {
                console.log(error)
                throw(error)
            })    
    }
    static async getAll() {
        console.log('[Credential.getAll]')
        return axios.get(ENDPOINTS.credentials).then((response) => {
            const credentials = response.data
            for (const credential of credentials)
                Credential.cache.set(credential.uuid, credential)
            return credentials
        }).catch((error) => {
            console.log(error)
            throw(error)
        })
    }
    static async getCredentialsByOrg(uuid: string) {
        console.log('[Credential.getOrgCredentials]')
        return axios.get(ENDPOINTS.credentials_by_org(uuid)).then((response) => {
            const credentials = response.data
            for (const credential of credentials)
                Credential.cache.set(credential.uuid, credential)
            return credentials
        }).catch((error) => {
            console.log(error)
            throw(error)
        })
    }
    static async UpdateState(uuid: string, state: CredentialState) {
        console.log('[Credential.IssueCredential]')
        return axios.put(
            ENDPOINTS.credential_state_update(uuid), 
            { state: state },
        ).then((response) => {
            return response.data
        }).catch((error) => {
            console.log(error)
            throw(error)
        })
    }
    static async getForTemplates(uuids: string[]) {
        console.log('[Credential.getForTemplate]')
        return axios.get(
            ENDPOINTS.credentials_for_templates, 
            {params: {template_uuids: uuids.join(',')}},
        ).then((response) => {
            return response.data
        }).catch((error) => {
            console.log(error)
            throw(error)
        })
    }
}

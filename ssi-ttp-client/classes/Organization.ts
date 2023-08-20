import axios from 'axios'
import { ENDPOINTS } from '../config'


interface OrganizationData {
    // needs to match core.models.Organization
    uuid: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    owner: {
        uuid: string,
        name: string,
        email: string
    };
}


export default class Organization {
    private static cache: Map<string, OrganizationData> = new Map();

    constructor() {}

    static async get(uuid: string, forceFetch: boolean = false): Promise<OrganizationData> {
        console.log('[Organization.get] ' + uuid)
        if (!forceFetch && Organization.cache.has(uuid)) {
            return Organization.cache.get(uuid)!;
        }
        return axios.get(ENDPOINTS.organization(uuid))
            .then((response) => {
                Organization.cache.set(uuid, response.data);
                return response.data
            }).catch((error) => {
                console.log(error)
                throw(error)
            })    
    }
    static async getAll() {
        console.log('[Organization.getAll]')
        return axios.get(ENDPOINTS.organizations).then((response) => {
            const organizations = response.data
            for (const organization of organizations)
                Organization.cache.set(organization.uuid, organization)
            return organizations
        }).catch((error) => {
            console.log(error)
            throw(error)
        })
    }
}

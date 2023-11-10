import { v4 as uuidv4 } from 'uuid';

import { StoredType, StoredTypePrefix } from "../services/StorageService"

export enum SecretType {
    login = 'login',
    secret = 'secret',
    note = 'note',
    // TODO: add more types later
}
interface SecretDict {
    pk: string,
    secret_type: SecretType,
    name: string,
    description: string,
    data: any,
    updated: number,
    created: number,
    vaultPk: string
}

class Secret {
    pk: string
    secret_type: SecretType
    name: string
    description: string
    data: any
    updated: number // unix timestamp
    created: number // unix timestamp
    vaultPk: string

    constructor(
            pk: string,
            secret_type: SecretType,
            name: string,
            description: string,
            data: any,
            updated: number|null,
            created: number|null,
            vaultPk: string) {
        this.pk = pk
        this.secret_type = secret_type
        this.name = name
        this.description = description
        this.data = data
        this.updated = updated || Math.floor(Date.now() / 1000)
        this.created = created || Math.floor(Date.now() / 1000)
        this.vaultPk = vaultPk
    }
    static async create(secret_type: SecretType, name: string, 
            description: string, data: any, vaultPk: string) {
        let pk = StoredTypePrefix[StoredType.secret] + uuidv4()
        return new Secret(pk, secret_type, name, description, data, null, null, vaultPk)
    }
    toDict(): SecretDict {
        return {
            pk: this.pk,
            secret_type: this.secret_type,
            name: this.name,
            description: this.description,
            data: this.data,
            updated: this.updated,
            created: this.created,
            vaultPk: this.vaultPk
        }
    }
    static fromDict(data: SecretDict): Secret {
        return new Secret(
            data.pk, data.secret_type, data.name, data.description, data.data,
            data.updated, data.created, data.vaultPk
        )
    }
    // SAVE and DELETE done SecretManager
}

export default Secret
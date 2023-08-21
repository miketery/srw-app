import { v4 as uuidv4 } from 'uuid';

import SI, { StoredType, StoredTypePrefix } from "./StorageInterface"

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
    vault_pk: string
}

class Secret {
    pk: string
    secret_type: SecretType
    name: string
    description: string
    data: any
    updated: number // unix timestamp
    created: number // unix timestamp
    vault_pk: string

    constructor(
            pk: string,
            secret_type: SecretType,
            name: string,
            description: string,
            data: any,
            updated: number|null,
            created: number|null,
            vault_pk: string) {
        this.pk = pk
        this.secret_type = secret_type
        this.name = name
        this.description = description
        this.data = data
        this.updated = updated || Math.floor(Date.now() / 1000)
        this.created = created || Math.floor(Date.now() / 1000)
        this.vault_pk = vault_pk
    }
    static async create(secret_type: SecretType, name: string, 
            description: string, data: any, vault_pk: string) {
        let pk = StoredTypePrefix[StoredType.secret] + uuidv4()
        return new Secret(pk, secret_type, name, description, data, null, null, vault_pk)
    }
    to_dict(): SecretDict {
        return {
            pk: this.pk,
            secret_type: this.secret_type,
            name: this.name,
            description: this.description,
            data: this.data,
            updated: this.updated,
            created: this.created,
            vault_pk: this.vault_pk
        }
    }
    static from_dict(data: SecretDict): Secret {
        return new Secret(
            data.pk, data.secret_type, data.name, data.description, data.data,
            data.updated, data.created, data.vault_pk
        )
    }
    async save() {
        return await SI.save(this.pk, this.to_dict())
    }
}

export default Secret
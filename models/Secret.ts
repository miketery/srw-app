import { v4 as uuidv4 } from 'uuid';

import { StoredType, StoredTypePrefix } from "../services/StorageService"

export enum SecretType {
    key = 'key',
    login = 'login',
    note = 'note',
    document = 'document',
    // TODO: add more types later
}
export type HistoricSecretData = {
    data: any,
    ts: number,
}
type SecretDict = {
    pk: string,
    secretType: SecretType,
    name: string,
    description: string,
    data: {},
    updated: number,
    created: number,
    vaultPk: string
    history: HistoricSecretData[]
}

class Secret {
    pk: string
    secretType: SecretType
    name: string
    description: string
    data: any
    updated: number // unix timestamp
    created: number // unix timestamp
    vaultPk: string

    history: HistoricSecretData[]

    constructor(
            pk: string,
            secretType: SecretType,
            name: string,
            description: string,
            data: any,
            updated: number|null,
            created: number|null,
            vaultPk: string, history: HistoricSecretData[]) {
        this.pk = pk
        this.secretType = secretType
        this.name = name
        this.description = description
        this.data = data
        this.updated = updated || Math.floor(Date.now() / 1000)
        this.created = created || Math.floor(Date.now() / 1000)
        this.vaultPk = vaultPk
        this.history = history || []
    }
    toString(): string {
        return `Secret<${this.pk}, ${this.secretType}, ${this.name}, ${this.updated}, ${this.created}>`
    }
    static async create(secretType: SecretType, name: string, 
            description: string, data: any, vaultPk: string) {
        let pk = StoredTypePrefix[StoredType.secret] + uuidv4()
        return new Secret(pk, secretType, name, description, data, null, null, vaultPk, [])
    }
    async update(name: string, description: string, data: any) {
        this.name = name
        this.description = description
        this.history.push({
            data: this.data,
            ts: this.updated,
        })
        this.data = data
        this.updated = Math.floor(Date.now() / 1000)
    }
    toDict(): SecretDict {
        return {
            pk: this.pk,
            secretType: this.secretType,
            name: this.name,
            description: this.description,
            data: this.data,
            updated: this.updated,
            created: this.created,
            vaultPk: this.vaultPk,
            history: this.history,
        }
    }
    static fromDict(data: SecretDict): Secret {
        return new Secret(
            data.pk, data.secretType, data.name, data.description, data.data,
            data.updated, data.created, data.vaultPk, data.history
        )
    }
    // SAVE and DELETE done SecretManager
}

export default Secret
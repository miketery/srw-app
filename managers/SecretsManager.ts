import Secret from '../models/Secret'
import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault';

class SecretsManager {
    // private static _instance: SecretsManager;
    private _secrets: {string?: Secret};
    private _vault: Vault | null;

    constructor(vault: Vault) { 
        console.log('[SecretsManager.constructor]')
        this._secrets = {};
        this._vault = vault;
    }
    // public static getInstance(): SecretsManager {
    //     if (!SecretsManager._instance) {
    //         SecretsManager._instance = new SecretsManager();
    //     }
    //     return SecretsManager._instance;
    // }
    clear() { this._secrets = {}; }
    // init() {
    //     console.log('[SecretsManager.init]')
    // }
    async deleteSecret(secret: Secret): Promise<void> {
        await SS.delete(secret.pk);
        delete this._secrets[secret.pk];
    }
    async saveSecret(secret: Secret): Promise<void> {
        await SS.save(secret.pk, secret.toDict());
        this._secrets[secret.pk] = secret;
    }
    async loadSecrets(): Promise<{string?: Secret}> {
        if(!this._vault)
            throw new Error('Vault not set')
        let secrets: {string?: Secret} = {};
        let secrets_data = await SS.getAll(StoredType.secret, this._vault.pk);
        for (let secret_data of Object.values(secrets_data)) {
            let s = Secret.fromDict(secret_data);
            secrets[s.pk] = s;
        }
        this._secrets = secrets;
        return this._secrets;
    }
    getSecrets(): {string?: Secret} {
        return this._secrets;
    }
    getSecretsArray(): Secret[] {
        return Object.values(this.getSecrets());
    }
    getSecret(pk: string, raise_exception = false): Secret|null {
        if(pk in this._secrets)
            return this._secrets[pk];
        if(raise_exception)
            throw new Error(`Secret not found: ${pk}`);
        return null;
    }
    get vault(): Vault | null {
        return this._vault;
    }
    get length(): number {
        return Object.keys(this._secrets).length;
    }
    get index(): string[] {
        return Object.keys(this._secrets);
    }
}

export default SecretsManager; // singleton
import Secret from './Secret'
import SI, { StoredType } from './StorageInterface'

import Vault from './Vault';

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
    async delete_secret(secret: Secret): Promise<void> {
        await SI.delete(secret.pk);
        delete this._secrets[secret.pk];
    }
    async save_secret(secret: Secret): Promise<void> {
        await SI.save(secret.pk, secret.to_dict());
        this._secrets[secret.pk] = secret;
    }
    async load_secrets(): Promise<{string?: Secret}> {
        if(!this._vault)
            throw new Error('Vault not set')
        let secrets: {string?: Secret} = {};
        let secrets_data = await SI.getAll(StoredType.secret, this._vault.pk);
        for (let secret_data of Object.values(secrets_data)) {
            let s = Secret.from_dict(secret_data);
            secrets[s.pk] = s;
        }
        this._secrets = secrets;
        return this._secrets;
    }
    get_secrets(): {string?: Secret} {
        return this._secrets;
    }
    get_secrets_array(): Secret[] {
        return Object.values(this.get_secrets());
    }
    get_secret(pk: string, raise_exception = false): Secret|null {
        if(pk in this._secrets)
            return this._secrets[pk];
        if(raise_exception)
            throw new Error(`Secret not found: ${pk}`);
        return null;
    }
    get vault(): Vault | null {
        return this._vault;
    }
    get secrets_count(): number {
        return Object.keys(this._secrets).length;
    }
    get index(): string[] {
        return Object.keys(this._secrets);
    }
}

export default SecretsManager; // singleton
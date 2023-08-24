import Secret from './Secret'
import SI, { StoredType } from './StorageInterface'

import Vault from './Vault';

class SecretsManager {
    private static _instance: SecretsManager;
    private _secrets: {string?: Secret};
    private _vault: Vault | null;

    constructor() { this._secrets = {}; }
    public static getInstance(): SecretsManager {
        if (!SecretsManager._instance) {
            SecretsManager._instance = new SecretsManager();
        }
        return SecretsManager._instance;
    }
    clear() { this._secrets = {}; }
    init(vault: Vault) {
        console.log('[SecretsManager.init]')
        this._vault = vault;
        this.load_secrets();
    }
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

const SM = SecretsManager.getInstance();

export default SM; // singleton
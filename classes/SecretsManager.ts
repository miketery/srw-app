import Secret from './Secret'
import SI, { StoredType } from './StorageInterface'

import Vault from './Vault';

class SecretsManager {
    private static _instance: SecretsManager;
    private _secrets: Secret[];
    private _vault: Vault | null;

    constructor() {
        // initialize secrets
        this._secrets = [];
    }
    public static getInstance(): SecretsManager {
        if (!SecretsManager._instance) {
            SecretsManager._instance = new SecretsManager();
        }
        return SecretsManager._instance;
    }
    clear() {
        this._secrets = [];
    }
    init(vault: Vault) {
        console.log('[SecretsManager.init]')
        this._vault = vault;
        this.load_secrets();
    }
    async load_secrets(): Promise<Secret[]> {
        if(!this._vault)
            throw new Error('Vault not set')
        // load secrets from async storage
        let secrets: Secret[] = [];
        // TODO: should probably not use this cache for the current vault pk
        let secrets_data = await SI.getAll(StoredType.secret, this._vault.pk);
        for (let secret_data of Object.values(secrets_data)) {
            secrets.push(Secret.from_dict(secret_data));
        }
        this._secrets = secrets;
        return this._secrets;
    }
    async get_secrets(force=false): Promise<Secret[]> {
        if(force || this._secrets.length === 0) {
            return this.load_secrets();
        }
        return this._secrets;
    }
    get_secret(pk: string, raise_exception = false) {
        const secret = this._secrets.find(secret => secret.pk === pk);
        if (!secret && raise_exception) {
            throw new Error(`Secret not found: ${pk}`);
        }
        return secret;
    }
    get vault(): Vault | null {
        return this._vault;
    }
}

const SM = SecretsManager.getInstance();

export default SM; // singleton
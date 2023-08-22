import Vault from './Vault';
import SI, { StoredType } from './StorageInterface';
import { signingKeyFromWords, encryptionKeyFromWords, getRandom } from '../lib/utils'
import { v4 as uuidv4 } from 'uuid';
import { entropyToMnemonic } from 'bip39';

import CM from './ContactsManager';
import SM from './SecretsManager';

class VaultManager {
    private static _instance: VaultManager;
    private _vaults: Vault[];
    private _current_vault: Vault | null;

    constructor() {
        this._vaults = [];
        this._current_vault = null;
    }
    public static get_instance(): VaultManager {
        if (!VaultManager._instance) {
            VaultManager._instance = new VaultManager();
        }
        return VaultManager._instance;
    }
    async init(): Promise<void> {
        console.log('[VaultManager.init]')
        await this.load_vaults();
        console.log('[VaultManager.init2]')

        if (this._vaults.length > 0) {
            console.log('[VaultManager.init3]')
            this.set_vault();
            this.init_managers();
            console.log('[VaultManager.init4]')
        }
    }
    async load_vaults(): Promise<Vault[]> {
        let vaults: Vault[] = [];
        let vaults_data = await SI.getAll(StoredType.vault);
        console.log(vaults_data)
        for (let vault_data of Object.values(vaults_data)) {
            console.log(vault_data)
            vaults.push(Vault.from_dict(vault_data));
        }
        this._vaults = vaults;
        return vaults;
    }
    set_vault(vault_pk: string|null=null) {
        if(!vault_pk)
            this._current_vault = this._vaults[0]
        else
            this._current_vault = this.get_vault(vault_pk);
    }
    init_managers() {
        console.log('[VaultManager.init_managers]')
        if (!this._current_vault)
            throw new Error('Current vault not set');
        SM.init(this._current_vault);
        CM.init(this._current_vault);
    }
    async save_vault(vault: Vault): Promise<void> {
        return SI.save(vault.pk, vault.to_dict());
    }
    from_dict(vault_data: any): Vault {
        return Vault.from_dict(vault_data);
    }
    async create_vault(name: string, display_name: string, email: string = '',
            words: string = '', digital_agent_host: string = '', save: boolean = true): Promise<Vault> {
        if (words == '') {
            let entropy = await getRandom(16)
            words = entropyToMnemonic(Buffer.from(entropy))
        }
        console.log(words)
        let signingKeyPair = signingKeyFromWords(words);
        let encKeyPair = encryptionKeyFromWords(words);
        let new_vault = new Vault(
            uuidv4(), name, email, display_name, digital_agent_host,
            words,
            signingKeyPair.secretKey, signingKeyPair.publicKey,
            encKeyPair.secretKey, encKeyPair.publicKey);
        let vault = this.get_vault(new_vault.pk);
        if (vault) {
            throw new Error(`Vault with Verify Key ${vault.pk} already exists`);
        }
        if (save) {
            await SI.save(new_vault.pk, new_vault.to_dict());
            // check that saved
            let vault_data = await SI.get(new_vault.pk);
            if (!vault_data) {
                throw new Error(`Could not save vault ${new_vault.pk}`);
            } else {
                this._vaults.push(new_vault);
                return new_vault;
            }
        } else {
            this._vaults.push(new_vault);
            this._current_vault = new_vault;
            return new_vault;
        }
    }
    get_vault(pk: string): Vault | null {
        for (let vault of this._vaults) {
            if (vault.pk == pk) {
                return vault;
            }
        }
        return null;
    }
    get_vault_by_did(did: string): Vault | null {
        for (let vault of this._vaults) {
            if (vault.did == did) {
                return vault;
            }
        }
        return null;
    }
    vault_is_set(): boolean {
        return this._current_vault !== null;
    }
    get current_vault_pk(): string {
        if (!this._current_vault)
            throw new Error('Current vault not set');
        return this._current_vault.pk;
    }
}

const VM = VaultManager.get_instance();
export default VM; // singleton
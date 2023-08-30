import Vault from './Vault';
import SI, { StoredType } from './StorageInterface';
import { signingKeyFromWords, encryptionKeyFromWords, getRandom } from '../lib/utils'
import { v4 as uuidv4 } from 'uuid';
import { entropyToMnemonic } from 'bip39';

import ContactsManager from './ContactsManager';
import SecretsManager from './SecretsManager';

class VaultManager {
    // private static _instance: VaultManager;
    private _vaults: Vault[];
    private _current_vault: Vault | null;
    private _secrets_manager: SecretsManager | null;
    private _contacts_manager: ContactsManager | null;

    constructor() {
        this._vaults = [];
        this._current_vault = null;
    }
    // public static get_instance(): VaultManager {
    //     if (!VaultManager._instance) {
    //         VaultManager._instance = new VaultManager();
    //     }
    //     return VaultManager._instance;
    // }
    async init(): Promise<void> {
        console.log('[VaultManager.init]')
        await this.loadVaults();
        if (this._vaults.length > 0) {
            console.log('[VaultManager.init] _vaults.length > 0')
            this.setVault();
            this.initManagers();
        }
    }
    async loadVaults(): Promise<Vault[]> {
        console.log('[VaultManager.loadVaults]')
        let vaults: Vault[] = [];
        let vaults_data = await SI.getAll(StoredType.vault);
        console.log(vaults_data)
        for (let vault_data of Object.values(vaults_data)) {
            console.log(vault_data)
            vaults.push(Vault.fromDict(vault_data));
        }
        this._vaults = vaults;
        return vaults;
    }
    setVault(vault_pk: string|null=null) {
        if(!vault_pk)
            this._current_vault = this._vaults[0]
        else
            this._current_vault = this.getVault(vault_pk);
    }
    async initManagers(): Promise<void> {
        console.log('[VaultManager.initManagers]')
        if (!this._current_vault)
            throw new Error('Current vault not set');
        this._secrets_manager = new SecretsManager(this._current_vault);
        this._contacts_manager = new ContactsManager(this._current_vault);
        await Promise.all([
            this._secrets_manager.loadSecrets(),
            this._contacts_manager.loadContacts()
        ])
    }
    async saveVault(vault: Vault): Promise<void> {
        return SI.save(vault.pk, vault.toDict());
    }
    fromDict(vault_data: any): Vault {
        return Vault.fromDict(vault_data);
    }
    async createVault(name: string, display_name: string, email: string = '',
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
        let vault = this.getVault(new_vault.pk);
        if (vault) {
            throw new Error(`Vault with Verify Key ${vault.pk} already exists`);
        }
        if (save) {
            await SI.save(new_vault.pk, new_vault.toDict());
            // check that saved
            let vault_data = await SI.get(new_vault.pk);
            if (!vault_data) {
                throw new Error(`Could not save vault ${new_vault.pk}`);
            } else {
                this._vaults.push(new_vault);
                this._current_vault = new_vault;
                return new_vault;
            }
        } else {
            this._vaults.push(new_vault);
            this._current_vault = new_vault;
            return new_vault;
        }
    }
    getVault(pk: string): Vault | null {
        for (let vault of this._vaults) {
            if (vault.pk == pk) {
                return vault;
            }
        }
        return null;
    }
    getVaultByDid(did: string): Vault | null {
        for (let vault of this._vaults) {
            if (vault.did == did) {
                return vault;
            }
        }
        return null;
    }
    vaultIsSet(): boolean {
        return this._current_vault !== null;
    }
    get current_vault_pk(): string {
        if (!this._current_vault)
            throw new Error('Current vault not set');
        return this._current_vault.pk;
    }
    get current_vault(): Vault {
        if (!this._current_vault)
            throw new Error('Current vault not set');
        return this._current_vault;
    }
    get secrets_manager(): SecretsManager {
        console.log('secret manager get')
        if (!this._secrets_manager)
            throw new Error('Secrets Manager not set');
        return this._secrets_manager;
    }
    get contacts_manager(): ContactsManager {
        if (!this._contacts_manager)
            throw new Error('Contacts Manager not set');
        return this._contacts_manager;
    }
}

// const VM = VaultManager.get_instance();
export default VaultManager; // singleton
import Vault from './Vault';
import SI, { StoredType } from './StorageInterface';
import { signingKeyFromWords, encryptionKeyFromWords, getRandom } from '../lib/utils'
import { v4 as uuidv4 } from 'uuid';
import { entropyToMnemonic } from 'bip39';

import ContactsManager from './ContactsManager';
import SecretsManager from './SecretsManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionInterface {
    vault_pk?: string;
}

class VaultManager {
    // private static _instance: VaultManager;
    private _vaults: {string?: Vault};
    private _current_vault: Vault | null;
    private _secrets_manager: SecretsManager | null;
    private _contacts_manager: ContactsManager | null;
    private _session: SessionInterface;

    constructor() {
        this._vaults = {};
        this._current_vault = null;
        this._session = {}
    }
    async init(): Promise<void> {
        console.log('[VaultManager.init]')
        await this.loadVaults();
        const did_load = await this.loadSession();
        console.log('did_load', did_load)
        if(did_load && this._session.vault_pk) {
            this.setVault(this._session.vault_pk);
            this.initManagers();
        } else {
            if (Object.keys(this._vaults).length > 0) {
                this.setVault(Object.keys(this._vaults)[0]); // first one
                this.saveSession();
                this.initManagers();
            }
        }
    }
    async loadSession(): Promise<Boolean> {
        console.log('[VaultManager.loadSession]')
        const res = await AsyncStorage.getItem('SESSION');
        if(res) {
            const data = JSON.parse(res);
            this._session = data;
            return true
        }
        return false
    }
    async saveSession(): Promise<void> {
        console.log('[VaultManager.saveSession]')
        await AsyncStorage.setItem('SESSION', JSON.stringify(this._session));
    }
    async loadVaults(): Promise<{string?: Vault}> {
        console.log('[VaultManager.loadVaults]')
        const vaults = {};
        const vaults_data = await SI.getAll(StoredType.vault);
        for (let vault_data of Object.values(vaults_data)) {
            const v = Vault.fromDict(vault_data);
            vaults[v.pk] = v;
        }
        this._vaults = vaults;
        return vaults;
    }
    getVaultsArray(): Vault[] {
        return Object.values(this._vaults);
    }
    setVault(vault_pk: string) {
        this._session.vault_pk = vault_pk;
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
    async createVault(name: string, display_name: string, email: string,
            digital_agent_host: string, words: string,
            save: boolean = true): Promise<Vault> {
        const new_vault = await Vault.create(name, display_name, email, 
            digital_agent_host, words);
        const vault = this.getVault(new_vault.pk);
        if (vault)
            throw new Error(`Vault with Verify Key ${vault.pk} already exists`);
        if (save) {
            await SI.save(new_vault.pk, new_vault.toDict());
            // check that saved
            const vault_data = await SI.get(new_vault.pk);
            if (!vault_data)
                throw new Error(`Could not save vault ${new_vault.pk}`);
        }
        this._vaults[new_vault.pk] = new_vault;
        this._current_vault = new_vault;
        this._session.vault_pk = new_vault.pk;
        this.saveSession();
        return new_vault;
    }
    getVault(pk: string): Vault {
        return this._vaults[pk];
    }
    getVaultByDid(did: string): Vault | null {
        for (let vault of this.getVaultsArray()) {
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

export default VaultManager;

// singleton example
// Class VaultManager {
//     public static get_instance(): VaultManager {
//         if (!VaultManager._instance) {
//             VaultManager._instance = new VaultManager();
//         }
//         return VaultManager._instance;
//     }
// }
// const VM = VaultManager.get_instance();
import Vault from '../models/Vault';
import SS, { StoredType } from '../services/StorageService';
import { signingKeyFromWords, encryptionKeyFromWords, getRandom } from '../lib/utils'
import { v4 as uuidv4 } from 'uuid';
import { entropyToMnemonic } from 'bip39';

import ContactsManager from './ContactsManager';
import SecretsManager from './SecretsManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DigitalAgentService from '../services/DigitalAgentService';

interface SessionInterface {
    vault_pk: string;
}

class VaultManager {
    // private static _instance: VaultManager;
    private _vaults: {string?: Vault};
    private _current_vault: Vault | null;
    private _secrets_manager: SecretsManager | null;
    private _contacts_manager: ContactsManager | null;
    private _session: SessionInterface;

    constructor(vaults: {string?: Vault} = {}) {
        this._vaults = vaults;
        this._current_vault = null;
        this._session = {vault_pk: ''}
    }
    async init(): Promise<void> {
        console.log('[VaultManager.init]')
        await this.loadVaults();
        const session = await this.loadSession();
        console.log('[VaultManager.init] session: ', session)
        const promises: Promise<any>[] = [];
        if(session.vault_pk in Object.keys(this._vaults)) { 
            // have session and the vault pk set in it
            this.setVault(session.vault_pk);
        } else if (Object.keys(this._vaults).length > 0) { 
            // no session or no vault pk set
            // but we have vaults? set first one to the sssion
            this.setVault(Object.keys(this._vaults)[0]);
            promises.push(this.saveSession()); // save the session
        }
        if(!this._current_vault) // could be else, but for type script sake...
            return
        promises.push(this.initManagers());
        // if not registered do it now (maybe was offline earlier)
        promises.push(this.checkRegistered(this._current_vault, true));
        await Promise.all(promises);
    }
    async loadSession(): Promise<SessionInterface> {
        console.log('[VaultManager.loadSession]')
        const res = await AsyncStorage.getItem('SESSSON');
        if(res) {
            const data = JSON.parse(res);
            this._session = data;
            return this._session
        }
        return this._session
    }
    async saveSession(): Promise<void> {
        console.log('[VaultManager.saveSession]')
        await AsyncStorage.setItem('SESSSON', JSON.stringify(this._session));
    }
    async loadVaults(): Promise<{string?: Vault}> {
        console.log('[VaultManager.loadVaults]')
        const vaults = {};
        const vaults_data = await SS.getAll(StoredType.vault);
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
    setVault(vault_pk: string): void {
        this._session.vault_pk = vault_pk;
        this._current_vault = this.getVault(vault_pk);
    }
    async checkRegistered(vault: Vault, ifNotRegister: boolean): Promise<Boolean> {
        console.log('[VaultManager.checkRegistered]')
        const data = await DigitalAgentService.amIRegistered(vault);
        if(data) {
            vault.registered = true;
            vault.short_code = data['short_code'];
            this.saveVault(vault);
            return true
        } else if (ifNotRegister) {
            // try to register
            const res = await DigitalAgentService.registerVault(vault);
            if(res) {
                vault.registered = true;
                vault.short_code = res['short_code'];
                this.saveVault(vault);
                return true
            } else {
                return false
            }
        }
        return false
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
        return SS.save(vault.pk, vault.toDict());
    }
    async createVault(name: string, email: string, display_name: string,
            digital_agent_host: string, words: string,
            save: boolean = true): Promise<Vault> {
        const new_vault = await Vault.create(name, email, display_name,
            digital_agent_host, words);
        if (Object.keys(this._vaults).includes(new_vault.pk))
            throw new Error(`Vault with Verify Key ${new_vault.pk} already exists`);
        if (save) {
            await this.saveVault(new_vault);
            // check that saved
            const vault_data = await SS.get(new_vault.pk);
            if (!vault_data)
                throw new Error(`Could not save vault ${new_vault.pk}`);
        }
        const res = await DigitalAgentService.registerVault(new_vault);
        if(res) {
            new_vault.registered = true;
            new_vault.short_code = res['short_code'];
            save && await this.saveVault(new_vault);
        } else {
            // couldn't register vault
            // check already registered?
            const res = await DigitalAgentService.amIRegistered(new_vault);
            if(res) {
                new_vault.registered = true;
                new_vault.short_code = res['short_code'];
                save && await this.saveVault(new_vault);
            }
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
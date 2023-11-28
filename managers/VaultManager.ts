import Vault from '../models/Vault';
import SS, { StoredType } from '../services/StorageService';

import ContactsManager from './ContactsManager';
import SecretsManager from './SecretsManager';
import RecoveryPlansManager from './RecoveryPlansManager';
import GuardiansManager from './GuardiansManager';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DigitalAgentService from '../services/DigitalAgentService';
import NotificationsManager from './NotificationsManager';
import InboundMessageManager from './MessagesManager';
import { MOCK } from '../config';
import RecoverCombine from '../models/RecoverCombine';
import RecoverVaultUtil from './RecoverVaultUtil';

interface SessionDict {
    vaultPk: string;
}

class VaultManager {
    // private static _instance: VaultManager;
    private _vaults: {string?: Vault};
    private _currentVault: Vault | null;
    private _secretsManager: SecretsManager | null;
    private _contactsManager: ContactsManager | null;
    private _recoveryPlansManager: RecoveryPlansManager | null;
    private _guardiansManager: GuardiansManager | null;

    private _notificationsManager: NotificationsManager | null;
    private _messagesManager: InboundMessageManager | null;
    private _session: SessionDict;

    private _recoverCombine: RecoverCombine | null;

    constructor(vaults: {string?: Vault} = {}) {
        this._vaults = vaults;
        this._currentVault = null;
        this._session = {vaultPk: ''}
    }
    async init(): Promise<void> {
        console.log('[VaultManager.init]')
        await this.loadVaults();
        const session = await this.loadSession();
        console.log('[VaultManager.init] session: ', session)
        const promises: Promise<any>[] = [];
        if(session.vaultPk in Object.keys(this._vaults)) { 
            // have session and the vault pk set in it
            this.setVault(session.vaultPk);
        } else if (Object.keys(this._vaults).length > 0) { 
            // no session or no vault pk set
            // but we have vaults? set first one to the sssion
            this.setVault(Object.keys(this._vaults)[0]);
            promises.push(this.saveSession()); // save the session
        }
        if(!this._currentVault) // could be else, but for type script sake...
            return
        promises.push(this.initManagers());
        // if not registered do it now (maybe was offline earlier)
        // TODO: 
        !MOCK && promises.push(this.checkRegistered(this._currentVault, true));
        //       probably as part of state machine...
        await Promise.all(promises);
    }
    async loadSession(): Promise<SessionDict> {
        console.log('[VaultManager.loadSession]')
        const res = await AsyncStorage.getItem('SESSION');
        if(res) {
            const data = JSON.parse(res);
            this._session = data;
            return this._session
        }
        return this._session
    }
    async saveSession(): Promise<void> {
        console.log('[VaultManager.saveSession]')
        await AsyncStorage.setItem('SESSION', JSON.stringify(this._session));
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
    setVault(vaultPk: string): void {
        this._session.vaultPk = vaultPk;
        this._currentVault = this.getVault(vaultPk);
    }
    async checkRegistered(vault: Vault, ifNotThenRegister: boolean): Promise<boolean> {
        console.log('[VaultManager.checkRegistered]')
        const data = await DigitalAgentService.amIRegistered(vault);
        if(data) {
            vault.registered = true;
            vault.short_code = data['short_code'];
            this.saveVault(vault);
            return true
        } else if (ifNotThenRegister) {
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
        if (!this._currentVault)
            throw new Error('Current vault not set');
        const recoverVaultLoad = async () => {
            if(this._currentVault.recovery)
                this._recoverCombine = await RecoverVaultUtil.loadRecoverCombine(this._currentVault);
            return
        }
        await recoverVaultLoad(); // had this in the promise ALl, but needs to be loaded before messages
        this._secretsManager = new SecretsManager(this._currentVault);
        this._contactsManager = new ContactsManager(this._currentVault);
        this._recoveryPlansManager = new RecoveryPlansManager(
            this._currentVault, {}, this._contactsManager);
        this._guardiansManager = new GuardiansManager(
            this._currentVault, {}, this._contactsManager);

        this._notificationsManager = new NotificationsManager(
            this._currentVault);
        this._messagesManager = new InboundMessageManager(
            this._currentVault, this);
        await Promise.all([
            // recoverVaultLoad(),
            this._secretsManager.loadSecrets(),
            this._contactsManager.loadContacts(),
            this._recoveryPlansManager.loadRecoveryPlans(),
            this._guardiansManager.loadGuardians(),
            this._notificationsManager.loadNotifications(),
            this._messagesManager.loadMessages(),
        ])
    }
    async saveVault(vault: Vault): Promise<void> {
        return SS.save(vault.pk, vault.toDict());
    }
    async createVault(name: string, email: string, display_name: string,
            digital_agent_host: string, words: string,
            save: boolean = true): Promise<Vault> {
        const new_vault = await Vault.create(name, email, display_name,
            digital_agent_host, words, false);
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
        this._currentVault = new_vault;
        this._session.vaultPk = new_vault.pk;
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
        return this._currentVault !== null;
    }
    get currentVaultPk(): string {
        if (!this._currentVault)
            throw new Error('Current vault not set');
        return this._currentVault.pk;
    }
    get currentVault(): Vault {
        if (!this._currentVault)
            throw new Error('Current vault not set');
        return this._currentVault;
    }
    get secretsManager(): SecretsManager {
        if (!this._secretsManager)
            throw new Error('Secrets Manager not set');
        return this._secretsManager;
    }
    get contactsManager(): ContactsManager {
        if (!this._contactsManager)
            throw new Error('Contacts Manager not set');
        return this._contactsManager;
    }
    get recoveryPlansManager(): RecoveryPlansManager {
        if (!this._recoveryPlansManager)
            throw new Error('Contacts Manager not set');
        return this._recoveryPlansManager;
    }
    get guardiansManager(): GuardiansManager {
        if (!this._guardiansManager)
            throw new Error('Guardians Manager not set');
        return this._guardiansManager;
    }
    get notificationsManager(): NotificationsManager {
        if (!this._notificationsManager)
            throw new Error('Notifications Manager not set');
        return this._notificationsManager;
    }
    get messagesManager(): InboundMessageManager {
        if (!this._messagesManager)
            throw new Error('Messages Manager not set');
        return this._messagesManager;
    }
    // recoverVault
    get recoverCombine(): RecoverCombine {
        if (!this._recoverCombine)
            throw new Error('Recover Combine not set');
        return this._recoverCombine;
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
import VaultManager from "./VaultManager";
import DigitalAgentService from "../services/DigitalAgentService";
import Vault from "../models/Vault";
import { Pk } from "../models/types";
import { pkToStoredType } from "../services/StorageService";

const kindToManager = {
    'contact': 'contactsManager',
    'secret': 'secretsManager',
    'notification': 'notificationsManager',
    'recoverSplit': 'recoverSplitsManager',
    'guardian': 'guardiansManager',
}

type FileManifest = {
    [kind: string]: {
        [pk: string]: {
            kind: string,
            hash: string,
            size: number,
        }
    }[]
}

class BackupManager {
    _vault: Vault;
    _manager: VaultManager;

    lastBackup: number;

    // localManifest: FileManifest;
    // remoteManifest: FileManifest;
    localPks: Pk[]
    remotePks: Pk[]

    constructor(vault: Vault, manager: VaultManager) {
        this._vault = vault;
        this._manager = manager;
    }
    async fetchManifest(): Promise<Pk[]|false> {
        try {
            const fileManifest = await DigitalAgentService.getBackupManifest(this._vault)
            if(!fileManifest)
                throw new Error('No file manifest')
            this.remotePks = fileManifest
            return this.remotePks
        } catch (e) {
            console.log(e)
        }
        return false
    }
    compileLocalPks(): Pk[] {
        const pks = Object.values(kindToManager).map(m => {
            console.log(m, 'getting index')
            return this._manager[m].index
        }).flat().filter(x => x !== undefined)
        this.localPks = pks
        return pks
    }
    getMissingRemotePks(): Pk[] {
        return this.localPks.filter(pk => !this.remotePks.includes(pk))
    }
    backupMissingObjects(): Promise<boolean> {
        const pksMissing = this.getMissingRemotePks();
        const objects = pksMissing.map(pk => {
            const managerName = kindToManager[pkToStoredType(pk)]
            console.log(pk, managerName, pkToStoredType(pk))
            return this._manager[managerName].getObject(pk)
        })
        return Promise.resolve(true)
    }
    // async compileLocalManifest(): Promise<boolean> {
    //     const kinds = Object.keys(managerToKind)
    //     const manifest: FileManifest = {}
    //     for(let kind of kinds) {
    //         const manager = this._manager[managerToKind[kind]]
    //         const items = await manager.getItems()
    //         manifest[kind] = items.map(item => {
    //             return {
    //                 kind: kind,
    //                 pk: item.pk,
    //                 hash: item.hash,
    //                 size: item.size,
    //             }
    //         })
    //     }
    //     this.localManifest = manifest
    //     return true
    // }

}

export default BackupManager;
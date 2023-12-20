import VaultManager from "../managers/VaultManager";
import DigitalAgentService from "../services/DigitalAgentService";
import Vault from "./Vault";

const managerToKind = {
    'contacts': 'contactsManaer',
    'secrets': 'secretsManager',
    'notifications': 'notificationsManager',
    'recoverSplits': 'recoverSplitsManager',
    'guardians': 'guardiansManager',
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

class BackupAndRestoreManager {
    _vault: Vault;
    _manager: VaultManager;

    lastBackup: number;

    localManifest: FileManifest;
    remoteManifest: FileManifest;

    constructor(vault: Vault, manager: VaultManager) {
        this._vault = vault;
        this._manager = manager;
    }
    async fetchManifest(): Promise<boolean> {
        try {
            const fileManifest = await DigitalAgentService.getFileManifest(this._vault)
            if(!fileManifest)
                throw new Error('No file manifest')
            return this.remoteManifest = fileManifest
        } catch (e) {
            console.log(e)
        }
        return false
    }
    async compileLocalManifest(): Promise<boolean> {
        const kinds = Object.keys(managerToKind)
        const manifest: FileManifest = {}
        for(let kind of kinds) {
            const manager = this._manager[managerToKind[kind]]
            const items = await manager.getItems()
            manifest[kind] = items.map(item => {
                return {
                    kind: kind,
                    pk: item.pk,
                    hash: item.hash,
                    size: item.size,
                }
            })
        }
        this.localManifest = manifest
        return true
    }

}

export default BackupAndRestoreManager;
import VaultManager from "./VaultManager";
import DigitalAgentService from "../services/DigitalAgentService";
import Vault from "../models/Vault";
import { Pk } from "../models/types";
import { pkToStoredType } from "../services/StorageService";
import { bytesToBase64 } from "../lib/utils";

const kindToManager = {
    'contact': 'contactsManager',
    'secret': 'secretsManager',
    'notification': 'notificationsManager',
    'recoverSplit': 'recoverSplitsManager',
    'guardian': 'guardiansManager',
}

type BackupState = {
    lastBackup: number,
    toBackup: string[],
    vaultPk: string,
}

class BackupUtil {
    _vault: Vault;
    _manager: VaultManager;

    state: BackupState;

    constructor(vault: Vault, manager: VaultManager) {
        this._vault = vault;
        this._manager = manager;
    }
    uploadObject(object: any) {
        const objectBytes = Buffer.from(JSON.stringify(object), 'utf-8');
        const encryptedBytes = this._vault.encryptPayload(objectBytes)
        return DigitalAgentService.uploadObject(
            this._vault,
            bytesToBase64(encryptedBytes),
            'create',
            object.pk
        )
    }
    getObjects(pks: string[]): Promise<any|false> {
        return DigitalAgentService.getObjects(this._vault, pks);
    }
    getEvents(opts: {after?: number, before?: number, pk?: Pk}) {
        return DigitalAgentService.getBackupEvents(this._vault, {
            after: 0,
            before: Math.floor(Date.now() / 1000),
            ...opts, // if passed will overwrite after and before
        });
    }

}

export default BackupUtil;
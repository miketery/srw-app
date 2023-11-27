import { Message } from "../models/Message";
import RecoverCombine from "../models/RecoverCombine";
import Vault from "../models/Vault";
import SS, { StoredType } from "../services/StorageService";
import { MessageTypes } from "./MessagesManager";

class RecoverVaultUtil {
    // uses a RecoverCombine to recover a vault
    // uses a temporary vault to facilitate the recovery process
    // vault: Vault
    // recoverCombine: RecoverCombine

    // constructor(vault: Vault) {
    //     this.vault = vault;
    //     this.loadRecoverCombine(vault);
    // }
    static async init(): Promise<{vault: Vault, recoverCombine: RecoverCombine}> {
        const vault = await Vault.create(`Recovery for Test`, 'recovery@arxsky.com', 'Test',
        '', '', true);
        const recoverCombine = RecoverCombine.create(vault, null);
        return { vault, recoverCombine };
    }
    static async loadRecoverCombine(vault: Vault): Promise<RecoverCombine|null> {
        const data = await SS.getAll(
            StoredType.recoverCombine, vault.pk);
        if(data.length === 0)
            return null
        return RecoverCombine.fromDict(data[0], vault);
    }
    static processManifest(vault: Vault, recoverCombine: RecoverCombine,
        message: Message): void {
        if(message.type_name !== MessageTypes.recoverCombine.manifest)
            throw new Error(`33 Invalid message type: ${message.type_name} should be ${MessageTypes.recoverCombine.manifest}`)
        message.decrypt(vault.private_key);
        const data = message.getData() as RecoverCombine;
        recoverCombine.setManifest(data.manifest);
        return
    }
    static recoverVault() {
        
    }
}

export default RecoverVaultUtil;
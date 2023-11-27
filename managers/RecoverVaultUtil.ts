import RecoverCombine from "../models/RecoverCombine";
import Vault from "../models/Vault";
import SS, { StoredType } from "../services/StorageService";

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
        const recoverCombine = await SS.getAll(
            StoredType.recoverCombine, vault.pk);
        return recoverCombine.length === 0 ? null : recoverCombine[0];
    }
    static recoverVault() {
        
    }
}

export default RecoverVaultUtil;
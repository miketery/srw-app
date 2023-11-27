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
        const vault = await Vault.create(`Recovery for Test`, '', 'Test',
        '', '', true);
        const recoverCombine = RecoverCombine.create(vault, null);
        return { vault, recoverCombine };
    }
    static loadRecoverCombine(vault: Vault): Promise<RecoverCombine> {
        // this.recoverCombine = new RecoverCombine(vault);
        const recoverCombine = SS.getAll(
            StoredType.recoverCombine, vault.pk);
        return recoverCombine[0];
    }
    static recoverVault() {
        
    }
}

export default RecoverVaultUtil;
import Vault from './Vault';
import SI from './SI';
import { signingKeyFromWords, encryptionKeyFromWords, getRandom } from '../lib/utils'
import { v4 as uuidv4 } from 'uuid';
import { entropyToMnemonic } from 'bip39';

// import Buffer

class VaultManager {
  private static instance: VaultManager;
  private vaults: Vault[];

  constructor() {
    if (VaultManager.instance) {
      return VaultManager.instance;
    }
    this.vaults = [];
    VaultManager.instance = this;
  }

  async load_vaults(): Promise<Vault[]> {
    // load vaults from async storage
    let vaults: Vault[] = [];
    let vaults_data = await SI.getAllAsync();
    for (let vault_data of Object.values(vaults_data)) {
      vaults.push(this.from_dict(vault_data));
    }
    this.vaults = vaults;
    return vaults;
  }
  async save_vault(vault: Vault): Promise<void> {
    return SI.saveAsync(vault.pk, vault.to_dict());
  }
  from_dict(vault_data: any): Vault {
    return Vault.from_dict(vault_data);
  }
  async create_vault(name: string, display_name: string, email: string = '',
  words: string = '', digital_agent_host: string = '', save: boolean = true): Promise<Vault> {
    let vault_uuid = uuidv4();
    if (words == '') {
      let entropy = await getRandom(16)
      words = entropyToMnemonic(Buffer.from(entropy))
    }
    console.log(words)
    let signingKeyPair = signingKeyFromWords(words);
    let encKeyPair = encryptionKeyFromWords(words);
    let new_vault = new Vault(
      vault_uuid, name, email, display_name, digital_agent_host,
      words,
      signingKeyPair.secretKey, signingKeyPair.publicKey,
      encKeyPair.secretKey, encKeyPair.publicKey);
    let vault = this.get_vault(new_vault.pk);
    if (vault) {
      throw new Error(`Vault with Verify Key ${vault.pk} already exists`);
    }
    if (save) {
      await SI.saveAsync(new_vault.pk, new_vault.to_dict());
      // check that saved
      let vault_data = await SI.getAsync(new_vault.pk);
      if (!vault_data) {
        throw new Error(`Could not save vault ${new_vault.pk}`);
      } else {
        this.vaults.push(new_vault);
        return new_vault;
      }
    } else {
      this.vaults.push(new_vault);
      return new_vault;
    }
  }
  get_vault(pk: string): Vault | null {
    for (let vault of this.vaults) {
      if (vault.pk == pk) {
        return vault;
      }
    }
    return null;
  }
  get_vault_by_did(did: string): Vault | null {
    for (let vault of this.vaults) {
      if (vault.did == did) {
        return vault;
      }
    }
    return null;
  }
}

const VM = new VaultManager();
export default VM; // singleton
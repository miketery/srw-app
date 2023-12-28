import Secret, { SecretType } from '../models/Secret'
import SS, { StoredType } from '../services/StorageService'

import Vault from '../models/Vault';
import { SecretPk } from '../models/types';
import TypeManager from './TypeManager';

class SecretsManager extends TypeManager {
    constructor(vault: Vault, secrets: {[pk: SecretPk]: Secret} = {}) { 
        console.log('[SecretsManager.constructor] ' + vault.pk)
        super(vault, secrets, StoredType.secret, Secret)
    }
    getSecret = this.get
    getSecrets = this.getAll
    getSecretsArray = this.getAllArray
    saveSecret = this.save
    deleteSecret = this.delete
    loadSecrets = this.load

    async createSecret(secretType: SecretType, name: string, description: string,
            data: any): Promise<Secret> {
        const new_secret = await Secret.create(secretType, name, description, data, this.vault.pk);
        await this.saveSecret(new_secret);
        return new_secret;
    }
}

export default SecretsManager;
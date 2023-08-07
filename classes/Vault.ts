import base58 from 'bs58'
const bip39 = require('bip39')

import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Import the required classes, modules or types here
import { SigningKey, VerifyKey, PrivateKey, PublicKey, SignedMessage } from '../lib/nacl';
import { sign_msg } from '../lib/utils'
// ContactManager, ObjectManager

class Vault {
  uuid: string;
  name: string;
  email: string;
  display_name: string;
  digital_agent_host: string;
  words: string; // 32 random bytes
  // Stretch using hashlib.pbkdf2_hmac sha512 2048 rounds
  signing_key: SigningKey; // appends 'signing'
  verify_key: VerifyKey;
  private_key: PrivateKey; // appends 'encryption'
  public_key: PublicKey;
//   contact_manager: ContactManager;
//   object_manager: ObjectManager;

  constructor(
      uuid: string,
      name: string,
      email: string,
      display_name: string,
      digital_agent_host: string,
      words: string,
      signing_key: SigningKey, verify_key: VerifyKey,
      private_key: PrivateKey, public_key: PublicKey) {
    this.uuid = uuid;
    this.name = name;
    this.email = email;
    this.display_name = display_name;
    this.digital_agent_host = digital_agent_host;
    this.words = words;
    this.signing_key = signing_key;
    this.verify_key = verify_key;
    this.private_key = private_key;
    this.public_key = public_key;
    // this.contact_manager = new ContactManager(this, join(this.base_dir, this.b58_verify_key, 'contacts.json'));
    // this.object_manager = new ObjectManager(join(this.base_dir, this.b58_verify_key, 'objects.json'));
  }
  get did(): string {
    return `did:arx:${this.b58_verify_key}`;
  }
  get b58_verify_key(): string { // public signing key in base58
    return base58.encode(this.verify_key);
  }
  get b58_signing_key(): string {
    return base58.encode(this.signing_key);
  }
  get b58_private_key(): string {
    return base58.encode(this.private_key);
  }
  get b58_public_key(): string {
    return base58.encode(this.public_key);
  }

  to_dict() {
    return {
      'uuid': this.uuid,
      'name': this.name,
      'email': this.email,
      'display_name': this.display_name,
      'digital_agent_host': this.digital_agent_host,
      'words': this.words,
      'signing_key': this.b58_signing_key,
      'verify_key': this.b58_verify_key,
      'private_key': this.b58_private_key,
      'public_key': this.b58_public_key,
    };
  }

  static from_dict(data: any, base_dir: string): Vault {
    data['signing_key'] = base58.decode(data['signing_key']);
    data['verify_key'] = base58.decode(data['verify_key']);
    data['private_key'] = base58.decode(data['private_key']);
    data['public_key'] =  base58.decode(data['public_key']);
    data['base_dir'] = base_dir;
    return new Vault(data['uuid'], data['name'], data['email'], data['display_name'], data['digital_agent_host'], data['words'], data['signing_key'], data['verify_key'], data['private_key'], data['public_key'], base_dir);
  }

  sign_payload(payload: any) {
    const data_bytes = JSON.stringify(payload); //.encode('utf-8');
    const signed = this.sign(data_bytes);
    return {
      'signed': Buffer.from(signed).toString('base64'),
      'verify_key': this.b58_verify_key
    };
  }
  sign(data: any): SignedMessage {
    return sign_msg(data, this.signing_key);
  }
}

class VaultManager {
  base_dir: string;
  vaults: Vault[];

  constructor(load_vaults = true) {
    this.vaults = load_vaults ? this.load_vaults() : [];
  }

  load_vaults(): Vault[] {
    // load vaults from async storage
    let vaults = [];

    return vaults;
  }

  save_vault(vault: Vault) {
    let dir_path = join(this.base_dir, vault.b58_verify_key);
    if (!existsSync(dir_path)) {
      mkdirSync(dir_path, { recursive: true });
    }
    writeFileSync(join(dir_path, 'vault.json'), JSON.stringify(vault.to_dict(), null, 4));
    vault.contact_manager.save_contacts();
    vault.object_manager.save_objects();
  }

  create_vault(name: string, display_name: string, email: string = '', words: string = null, digital_agent_host: string = null, save: boolean = true): Vault {
    let vault_uuid = uuidv4();
    if (!words) {
      words = randomBytes(32).toString();
    }
    let signing_key = GenerateSigningKey(words);
    let verify_key = GenerateVerificationKey(words);
    let private_key = GeneratePrivateKey(words);
    let public_key = GeneratePublicKey(words);
    let new_vault = new Vault(vault_uuid, name, email, display_name, digital_agent_host, words, signing_key, verify_key, private_key, public_key, this.base_dir);
    let vault = this.get_vault(new_vault.b58_verify_key);
    if (vault) {
      throw new Error(`Vault with Verify Key ${vault.b58_verify_key} already exists`);
    }
    if (save) {
       

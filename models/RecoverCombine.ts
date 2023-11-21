import { v4 as uuidv4 } from 'uuid';
import { interpret } from 'xstate';

import Vault, { VaultDict } from "./Vault";
import SS, { StoredTypePrefix } from '../services/StorageService';
import RecoverVaultMachine from '../machines/RecoverVaultMachine';
import { ManifestDict } from './RecoveryPlan';
import { Message, OutboundMessageDict, Receiver, Sender } from './Message';
import { RecoverCombineRequest } from './MessagePayload';
import { PublicKey, VerifyKey } from '../lib/nacl';
import base58 from 'bs58';
import { MessageTypes } from '../managers/MessagesManager';

enum RecoverCombineState {
    START = 'START',
    MANIFEST_LOADED = 'MANIFEST_LOADED',
    REQUESTING_SHARES = 'REQUESTING_SHARES',
    WAITING_ON_GUARDIANS = 'WAITING_ON_GUARDIANS',
    RECOVERING = 'RECOVERING',
}

enum CombinePartyState {
    START = 'START',
    REQUESTED = 'REQUESTED',
    WAITING = 'WAITING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

// type Manifest = {
//     name: string,
//     description: string,
//     digital_agent: string,
//     guardians: {
//         name: string,
//         state: CombinePartyState,
//         shares: string[],
//     }[],
// }
type CombinePartyDict = {
    name: string,
    did: string,
    verify_key: string,
    public_key: string,
    shares: string[],
    state: CombinePartyState,
}

type RecoverCombineDict = {
    pk: string,
    state: RecoverCombineState,
    manifest: ManifestDict,
    combinePartys: CombinePartyDict[],
    vault: VaultDict,
}

const vaultForRecovery = async (manifest: ManifestDict): Promise<Vault> => {
    return await Vault.create(`Recovery for ${manifest.name}`, '', manifest.name,
        '', '');
}

class CombineParty {
    name: string;
    did: string;
    verify_key: VerifyKey;
    public_key: PublicKey;
    shares: string[];
    state: CombinePartyState;

    recoverCombine: RecoverCombine

    constructor(name: string, did: string,
            verify_key: VerifyKey, public_key: PublicKey,
            shares: string[], state: CombinePartyState, recoverCombine: RecoverCombine) {
        this.name = name;
        this.did = did;
        this.verify_key = verify_key;
        this.public_key = public_key;
        this.shares = shares;
        this.state = state;
    }
    toDict(): CombinePartyDict {
        return {
            name: this.name,
            did: this.did,
            verify_key: base58.encode(this.verify_key),
            public_key: base58.encode(this.public_key),
            shares: this.shares,
            state: this.state,
        }
    }
    static fromDict(data: CombinePartyDict, recoverCombine: RecoverCombine): CombineParty {
        const verify_key = base58.decode(data.verify_key);
        const public_key = base58.decode(data.public_key);
        return new CombineParty(data.name,data.did,
            verify_key, public_key, data.shares, data.state, recoverCombine);
    }
    recoverCombineRequestMsg(recoverCombine: RecoverCombine): OutboundMessageDict { //TODO
        const data: RecoverCombineRequest = {
            recoveryPlanPk: recoverCombine.manifest.recoveryPlanPk,
            verify_key: recoverCombine.vault.b58_verify_key,
            public_key: recoverCombine.vault.b58_public_key,
        }
        const message = new Message(null, recoverCombine.vault.pk, null, 'outbound',
            Sender.fromVault(recoverCombine.vault),
            new Receiver(this.did, this.verify_key, this.public_key, Uint8Array.from([]), this.name),
            MessageTypes.recoverCombine.request, '0.1', 'X25519Box');
        message.setData(data);
        message.encryptBox(recoverCombine.vault.private_key)
        return message.outboundFinal();
    }
}

class RecoverCombine {
    /*
     * Used to recover a vault.
     * 1 - Loads a manifest for how to gather shares.
     * 2 - Creates a temporary vault for use with common interfaces to send encrypted messages
     * 3 - FSM manages the recovery process from Start to Recovered
     */
    pk: string;
    vault: Vault;
    manifest: ManifestDict;
    combinePartys: CombineParty[];
    state: RecoverCombineState;

    fsm: any;

    constructor(pk: string, vault: Vault,
            manifest: ManifestDict, combinePartys: CombinePartyDict[],
            state: RecoverCombineState) {
        this.pk = pk;
        this.vault = vault;
        this.manifest = manifest;
        this.combinePartys = combinePartys.map((cp) => CombineParty.fromDict(cp, this));
        this.state = state
    }
    initFSM() {
        this.fsm = interpret(RecoverVaultMachine.withContext({
            recoverVault: this,
            sender: this.vault.sender,
        }))
    }
    static async create(manifest: ManifestDict): Promise<RecoverCombine> {
        const pk = StoredTypePrefix.recoverVault + uuidv4();
        const vault = await vaultForRecovery(manifest);
        const combinePartys = manifest.recoveryPartys.map((g) => {
            return {...g, state: CombinePartyState.START, shares: []}
        });
        const recoveryVault = new RecoverCombine(pk, vault, manifest,
            combinePartys, RecoverCombineState.START);
        return recoveryVault;
    }
    toString(): string {
        return `RecoverVault<${this.pk} ${this.manifest.name} ${this.state}>`;
    }
    toDict(): RecoverCombineDict {
        return {
            pk: this.pk,
            vault: this.vault.toDict(),
            manifest: this.manifest,
            state: this.state,
            combinePartys: this.combinePartys.map((cp) => cp.toDict()),
        }
    }
    static fromDict(data: RecoverCombineDict): RecoverCombine {
        const vault = Vault.fromDict(data.vault);
        return new RecoverCombine(data.pk, vault, data.manifest, data.combinePartys, data.state);
    }
    async save(): Promise<void> {
        return SS.save(this.pk, this.toDict());
    }
    static async load(pk: string): Promise<RecoverCombine> {
        return SS.get(pk).then((data) => {
            if (!data)
                throw new Error(`Could not load RecoveryVault ${pk}`);
            return RecoverCombine.fromDict(data);
        });
    }
    delete(): Promise<void> {
        return SS.delete(this.pk);
    }
    combine(): void { //TODO
        throw new Error('Not implemented');
    }
    processRecoverCombineResponse(message: Message): void {
        throw new Error('Not implemented');
    }
}

export default RecoverCombine;
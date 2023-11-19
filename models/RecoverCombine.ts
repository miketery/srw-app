import { v4 as uuidv4 } from 'uuid';
import { interpret } from 'xstate';

import Vault, { VaultDict } from "./Vault";
import SS, { StoredTypePrefix } from '../services/StorageService';
import RecoverVaultMachine from '../machines/RecoverVaultMachine';
import { ManifestDict } from './RecoveryPlan';

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
    shares: string[];
    state: CombinePartyState;

    constructor(name: string, did: string, shares: string[], state: CombinePartyState) {
        this.name = name;
        this.did = did;
        this.shares = shares;
        this.state = state;
    }
    toDict(): CombinePartyDict {
        return {
            name: this.name,
            did: this.did,
            shares: this.shares,
            state: this.state,
        }
    }
    static fromDict(data: CombinePartyDict): CombineParty {
        return new CombineParty(data.name, data.did, data.shares, data.state);
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
            manifest: ManifestDict, combinePartys: CombineParty[],
            state: RecoverCombineState) {
        this.pk = pk;
        this.vault = vault;
        this.manifest = manifest;
        this.combinePartys = combinePartys.map((g) => {
            return new CombineParty(g.name, g.did, g.shares, g.state);
        });
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
            return new CombineParty(g.name, g.did, [], CombinePartyState.START);
        })
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
        const combinePartys = data.combinePartys.map((cp) => CombineParty.fromDict(cp));
        return new RecoverCombine(data.pk, vault, data.manifest, combinePartys, data.state);
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
}

export default RecoverCombine;
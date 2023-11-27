import { v4 as uuidv4 } from 'uuid';
import { interpret } from 'xstate';

import Vault, { VaultDict } from "./Vault";
import SS, { StoredTypePrefix } from '../services/StorageService';
import RecoverCombineMachine from '../machines/RecoverCombineMachine';
import CombinePartyMachine from '../machines/CombinePartyMachine';
import { ManifestDict } from './RecoveryPlan';
import { Message, OutboundMessageDict } from './Message';
import { RecoverCombineRequest, RecoverCombineResponse } from './MessagePayload';
import secrets from '../lib/secretsGrempe';
import { PublicKey, VerifyKey } from '../lib/nacl';
import base58 from 'bs58';
import { MessageTypes } from '../managers/MessagesManager';
import { base64toBytes, hexToBytes, open_sealed_box } from '../lib/utils';
import { SenderFunction } from '../services/DigitalAgentService';

enum RecoverCombineState {
    START = 'START',
    MANIFEST_LOADED = 'MANIFEST_LOADED',
    SENDING_REQUESTS = 'SENDING_REQUESTS',
    WAITING_ON_PARTICIPANTS = 'WAITING_ON_PARTICIPANTS',
    RECOVERING = 'RECOVERING',
    FINAL = 'FINAL'
}

enum CombinePartyState {
    START = 'START',
    SENDING_REQUEST = 'SENDING_REQUEST',
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
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
    data: {},
}

// const vaultForRecovery = async (manifest: ManifestDict): Promise<Vault> => {
//     return await Vault.create(`Recovery for ${manifest.name}`, '', manifest.name,
//         '', '', true);
// }

export class CombineParty {
    name: string;
    did: string;
    verify_key: VerifyKey;
    public_key: PublicKey;
    shares: string[];
    _state: CombinePartyState;

    recoverCombine: RecoverCombine;
    fsm: any;

    constructor(name: string, did: string,
            verify_key: VerifyKey, public_key: PublicKey,
            shares: string[], state: CombinePartyState, recoverCombine: RecoverCombine) {
        this.name = name;
        this.did = did;
        this.verify_key = verify_key;
        this.public_key = public_key;
        this.shares = shares;
        this._state = state;
        this.recoverCombine = recoverCombine;

        if(state !== CombinePartyState.ACCEPTED && this.recoverCombine.state !== RecoverCombineState.FINAL)
            this.initFSM();
    }
    get state(): CombinePartyState {
        if(this.fsm)
            return this.fsm.getSnapshot().value
        return this._state
    }
    initFSM() {
        console.log('[CombineParty.initFSM]', this.toString())
        if(this.fsm) {
            console.log('[CombineParty.initFSM] fsm already exists')
            return this.fsm
        }
        this.fsm = interpret(CombinePartyMachine.withContext({
            combineParty: this,
            sender: this.recoverCombine.sender,
        }))
        this.fsm.onTransition((state: {context: {combineParty: CombineParty}}) => {
            console.log('[CombineParty.fsm.onTransition]', state.context.combineParty.toString())
        })
        this.fsm.start(this._state)
        this.fsm.send('REDO')
        // ^^^^ v4 workaround to get invoke to work
        // if in SENDING_REQUEST state
        return this.fsm
    }
    toString(): string {
        return `CombineParty<${this.name} ${this.did} ${this.state}>`;
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
    save(): Promise<void> {
        return this.recoverCombine.save();
    }
    recoverCombineRequestMsg(): OutboundMessageDict { //TODO
        const data: RecoverCombineRequest = {
            recoveryPlanPk: this.recoverCombine.manifest.recoveryPlanPk,
            verify_key: this.recoverCombine.vault.b58_verify_key,
            public_key: this.recoverCombine.vault.b58_public_key,
        }
        const message = Message.forNonContact(this.recoverCombine.vault,
            {did: this.did, name: this.name, verify_key: this.verify_key, public_key: this.public_key},
            data, MessageTypes.recoverCombine.request, '0.1')
        message.encryptBox(this.recoverCombine.vault.private_key)
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
    manifest: ManifestDict | null;
    combinePartys: CombineParty[];
    _state: RecoverCombineState; //StateFrom<typeof RecoverCombineMachine>;
    data: {}; // for decrypted payload

    fsm: any;

    constructor(pk: string, vault: Vault,
            manifest: ManifestDict | null, combinePartys: CombinePartyDict[], data: {},
            state: RecoverCombineState) {
        this.pk = pk;
        this.vault = vault;
        this.manifest = manifest;
        this.combinePartys = combinePartys.map((cp) => CombineParty.fromDict(cp, this));
        this.data = data;
        this._state = state
        
        if(state !== RecoverCombineState.FINAL)
            this.initFSM();
    }
    initFSM() {
        this.fsm = interpret(RecoverCombineMachine.withContext({
            recoverCombine: this,
            // sender: this.sender,
        }))
        this.fsm.onTransition((state: {context: {recoverCombine: RecoverCombine}}) => {
            console.log('[RecoverCombine.fsm.onTransition]', state.context.recoverCombine.toString())
        })
        this.fsm.start(this._state)
    }
    get state(): RecoverCombineState {
        if(this.fsm)
            return this.fsm.getSnapshot().value;
        return this._state;
    }
    get sender(): SenderFunction {
        return this.vault.sender
    }
    static create(vault: Vault, manifest: ManifestDict | null): RecoverCombine {
        const pk = StoredTypePrefix.recoverCombine + uuidv4();
        const combinePartys = manifest === null ? [] : manifest.recoveryPartys.map((g) => {
            return {...g, state: CombinePartyState.START, shares: []}
        })
        const recoveryVault = new RecoverCombine(pk, vault, manifest,
            combinePartys, {}, RecoverCombineState.START);
        return recoveryVault;
    }
    setManifest(manifest: ManifestDict): void {
        this.manifest = manifest;
        const combinePartys = manifest.recoveryPartys.map((g) => {
            return {...g, state: CombinePartyState.START, shares: []}
        })
        this.combinePartys = combinePartys.map((cp) => CombineParty.fromDict(cp, this));
    }
    toString(): string {
        return `RecoverCombine<${this.pk} ${this.manifest?.name} ${this.state}>`;
    }
    toDict(): RecoverCombineDict {
        return {
            pk: this.pk,
            vault: this.vault.toDict(),
            manifest: this.manifest,
            state: this.state,
            combinePartys: this.combinePartys.map((cp) => cp.toDict()),
            data: this.data,
        }
    }
    static fromDict(data: RecoverCombineDict): RecoverCombine {
        const vault = Vault.fromDict(data.vault);
        return new RecoverCombine(data.pk, vault, data.manifest,
            data.combinePartys, data.data, data.state);
    }
    async save(): Promise<void> {
        return SS.save(this.pk, this.toDict());
    }
    static async load(pk: string): Promise<RecoverCombine> {
        return SS.get(pk).then((data) => {
            if (!data)
                throw new Error(`Could not load RecoverCombine ${pk}`);
            return RecoverCombine.fromDict(data);
        });
    }
    delete(): Promise<void> {
        return SS.delete(this.pk);
    }
    combine(): void { //TODO
        const shares = this.combinePartys.map((cp) => cp.shares).flat();
        const secret = hexToBytes(secrets.combine(shares));
        const decrypted = open_sealed_box(base64toBytes(this.manifest.encryptedPayload), secret);
        this.data = JSON.parse(new TextDecoder().decode(decrypted));
        console.log(this.data)
    }
    allRequestsSent(): boolean {
        return this.combinePartys.every((cp) => cp.state !== CombinePartyState.START);
    }
    allRequestsAccepted(): boolean {
        // TODO: should be when enough shares received
        return this.combinePartys.every((cp) => cp.state === CombinePartyState.ACCEPTED);
    }
    processRecoverCombineResponse(message: Message): void {
        console.log('[RecoverCombine.processRecoverCombineResponse]', message)
        message.decrypt(this.vault.private_key);
        const data = message.getData() as RecoverCombineResponse;
        const combineParty = this.combinePartys.filter((cp) => cp.did === message.sender.did)[0]
        if (!combineParty)
            throw new Error(`Could not find combineParty for ${message.sender.did}`);
        if (data.response === 'accept') {
            combineParty.shares = data.shares;
            combineParty.fsm.send('ACCEPT')
        } else {
            combineParty.fsm.send('DECLINE')
        }
    }
}

export default RecoverCombine;
import { ManifestDict } from "./RecoverSplit"

export interface ContactInvite {
    did: string,
    name: string,
    verify_key: string, // base58
    public_key: string, // base58
    contact_public_key: string, // base58
    email: string,
}
export interface ContactAccept {
    did: string,
    verify_key: string, // base58
    public_key: string, // base58
    contact_public_key: string, // base58
    email: string,
}
// ContactReject

export type RecoverSplitInvite = {
    name: string,
    description: string,
    shares: string[],
    manifest:  ManifestDict,
}
export type RecoverSplitResponse = {
    recoverSplitPk: string,
    response: 'accept' | 'decline',
}

export type RecoverCombineManifest = {
    manifest: ManifestDict,
}
export type RecoverCombineRequest = {
    recoverSplitPk: string,
    verify_key: string, // base58
    public_key: string, // base58
}
export type RecoverCombineResponse = {
    recoverSplitPk: string,
    response: 'accept' | 'decline',
    shares?: string[],
}
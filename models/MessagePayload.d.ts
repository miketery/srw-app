import { ManifestDict } from "./RecoveryPlan"

export interface ContactInvite {
    did: string,
    name: string,
    verify_key: string, // base58
    public_key: string, // base58
    contact_public_key: string, // base58
}
export interface ContactAccept {
    did: string,
    verify_key: string, // base58
    public_key: string, // base58
    contact_public_key: string, // base58
}
// ContactReject

export type RecoveryPlanInvite = {
    name: string,
    description: string,
    shares: string[],
    manifest:  ManifestDict,
}
export type RecoveryPlanResponse = {
    recoveryPlanPk: string,
    response: 'accept' | 'decline',
}

export type RecoverCombineRequest = {
    recoveryPlanPk: string,
    verify_key: string, // base58
    public_key: string, // base58
}
export type RecoverCombineResponse = {
    recoveryPlanPk: string,
    response: 'accept' | 'decline',
    shares?: string[],
}
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

export interface RecoveryPlanInvite {
    recoveryPlanPk: string,
    name: string,
    description: string,
    shares: string[],
}
export interface RecoveryPlanAccept {
    recoveryPlanPk: string,
}
export interface RecoveryPlanReject {
    recoveryPlanPk: string,
}
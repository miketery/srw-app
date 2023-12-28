export type Pk = string
export type VaultPk = Pk
export type ContactPk = Pk
export type SecretPk = Pk
export type NotificationPk = Pk

export interface ModelDict {
    pk: string
    vaultPk: string
}

export type Model = {
    pk: Pk
    vaultPk: string
    toDict: () => ModelDict
    // fromDict: (data: ModelDict, vault: Vault) => Model
}

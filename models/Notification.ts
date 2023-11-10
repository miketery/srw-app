import { v4 as uuidv4 } from 'uuid';
import { StoredTypePrefix } from "../services/StorageService";

export const NotificationTypes = {
    // If I'm Alice...
    app: {
        'test': 'app.test', // test message
        'info': 'app.info', // e.g. app generates some useful information (maybe wizard)
        'alert': 'app.alert', // e.g. app generates some alert
        'warning': 'app.warning', // e.g. app warns user about something
    },
    contact: {
        'request': 'contact.request', // Alice invites Bob to be her contact
        'accept': 'contact.accept', // Bob accepts Alice's invitation
    },
    recoverySetup: {
        'invite': 'recoverySetup.invite', // Alice invites Bob to be in her recovery setup
        'accept': 'recoverySetup.accept', // Bob accepts Alice's invitation
        'decline': 'recoverySetup.decline', // Bob declines Alice's invitation
    },
    recoverVault: {
        'request': 'recoverVault.request', // Alice requests Bob for recovery keyshare
        'accept': 'recoverVault.accept', // Bob accepts Alice's request
        'decline': 'recoverVault.decline', // Bob declines Alice's request
        // 'initiated': 'recoverVault.initiated', // Alice is informed of recovery initiation (in case of hacker)
    },
}

export interface NotificationData {
    title: string;
    short_text: string;
    detailed_text?: string;
    icon?: string;
    metadata?: any;
    // color?: string;
}

interface NotificationDict {
    pk: string;
    vaultPk: string;
    type: string;
    data: NotificationData;
    created: number;
}

class Notification {
    pk: string;
    vaultPk: string;
    type: string;
    data: NotificationData;
    created: number;
    
    constructor(pk: string, vaultPk: string, type: string, data: NotificationData, created: number) {
        this.pk = pk;
        this.vaultPk = vaultPk;
        this.type = type
        this.data = data;
        this.created = created;
    }
    static fromDict(data: NotificationDict): Notification {
        return new Notification(data.pk, data.vaultPk, data.type, data.data, data.created);
    }
    static create(vaultPk: string, type: string, data: any): Notification {
        return new Notification(StoredTypePrefix.notification + uuidv4(), vaultPk, type, data, Math.floor(Date.now() / 1000));
    }
    toDict(): NotificationDict {
        return {
            pk: this.pk,
            vaultPk: this.vaultPk,
            type: this.type,
            data: this.data,
            created: this.created,
        }
    }
}

export default Notification;
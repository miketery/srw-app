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
    vault_pk: string;
    type: string;
    data: NotificationData;
}

class Notification {
    pk: string;
    vault_pk: string;
    type: string;
    data: NotificationData;
    
    constructor(pk: string, vault_pk: string, type: string, data: NotificationData) {
        this.pk = pk;
        this.vault_pk = vault_pk;
        this.type = type
        this.data = data;
    }
    static fromDict(data: NotificationDict): Notification {
        return new Notification(data.pk, data.vault_pk, data.type, data.data);
    }
    static create(vault_pk: string, type: string, data: any): Notification {
        return new Notification(StoredTypePrefix.notification + uuidv4(), vault_pk, type, data);
    }
    toDict(): NotificationDict {
        return {
            pk: this.pk,
            vault_pk: this.vault_pk,
            type: this.type,
            data: this.data,
        }
    }
}

export default Notification;
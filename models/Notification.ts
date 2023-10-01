const NotificationTypesObj = {
    // If I'm Alice...
    app: {
        'info': 'app.info', // e.g. app generates some useful information (maybe wizard)
        'alert': 'app.alert', // e.g. app generates some alert
        'warning': 'app.warning', // e.g. app warns user about something
    },
    contact: {
        'invite': 'contact.invite', // Alice invites Bob to be her contact
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
// all nested values as array
const NotificationTypeAsArray: string[] = Object.values(NotificationTypesObj).reduce((a, b) => a.concat(Object.values(b)), []);

// this is wrong... TODO
type NotificationType = typeof NotificationTypeAsArray[number];

interface NotificationDict {
    pk: string;
    vault_pk: string;
    type: NotificationType;
    data: any; // TODO
}

class Notification {
    pk: string;
    vault_pk: string;
    type: NotificationType;
    data: any; // TODO
    
    constructor(pk: string, vault_pk: string, type: NotificationType, data: any) {
        this.pk = pk;
        this.vault_pk = vault_pk;
        this.type = type
        this.data = data;
    }
    static fromDict(data: NotificationDict): Notification {
        return new Notification(data.pk, data.vault_pk, data.type, data.data);
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
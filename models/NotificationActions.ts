import Notification, { NotificationTypes } from './Notification';
import NotificationsManager from '../managers/NotificationsManager';
import VaultManager from '../managers/VaultManager';

type NotificationAction = {
    title: string,
    action: (notification: Notification, manager: VaultManager) => void
}

export const consoleLogAction: NotificationAction = {
    title: 'console.log',
    action: (notification) => console.log(notification)    
}
const dismissAction: NotificationAction = {
    title: 'Dismiss',
    action: (notification, manager) => manager.notificationsManager.deleteNotification(notification)
}
const acceptContactRequestAction: NotificationAction = {
    title: 'Accept',
    action: (notification, manager) => {
        manager.contactsManager.acceptContactRequest(notification.data.metadata.did, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}

const acceptRecoverSplitInviteAction: NotificationAction = {
    title: 'Accept',
    action: (notification, manager) => {
        manager.guardiansManager.acceptGuardian(notification.data.metadata.pk, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}
const declineRecoverSplitInviteAction: NotificationAction = {
    title: 'Decline',
    action: (notification, manager) => {
        manager.guardiansManager.declineGuardian(notification.data.metadata.pk, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}

const acceptRecoverCombineRequestAction: NotificationAction = {
    title: 'Accept',
    action: (notification, manager) => {
        manager.guardiansManager.respondRecoverCombine('accept', notification.data.metadata, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}

const declineRecoverCombineRequestAction: NotificationAction = {
    title: 'Decline',
    action: (notification, manager) => {
        manager.guardiansManager.respondRecoverCombine('decline', notification.data.metadata, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}

const notificationActionsMap: {[key: string]: NotificationAction[]} = {
    [NotificationTypes.app.alert]: [dismissAction],
    [NotificationTypes.contact.request]: [
        acceptContactRequestAction,
        dismissAction
    ],
    [NotificationTypes.contact.accept]: [
        dismissAction
    ],
    // recoverSplit
    [NotificationTypes.recoverSplit.invite]: [
        acceptRecoverSplitInviteAction,
        declineRecoverSplitInviteAction,
    ],
    [NotificationTypes.recoverSplit.accept]: [
        dismissAction
    ],
    [NotificationTypes.recoverSplit.decline]: [
        dismissAction
    ],
    // recoverCombine
    [NotificationTypes.recoverCombine.manifest]: [
        dismissAction
    ],
    [NotificationTypes.recoverCombine.request]: [
        acceptRecoverCombineRequestAction,
        declineRecoverCombineRequestAction,
    ],
    [NotificationTypes.recoverCombine.accept]: [
        dismissAction
    ],
    [NotificationTypes.recoverCombine.decline]: [
        dismissAction
    ],
}

export default notificationActionsMap;
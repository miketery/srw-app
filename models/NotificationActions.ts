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

const acceptRecoveryPlanInviteAction: NotificationAction = {
    title: 'Accept',
    action: (notification, manager) => {
        manager.guardiansManager.acceptGuardian(notification.data.metadata.pk, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}
const declineRecoveryPlanInviteAction: NotificationAction = {
    title: 'Decline',
    action: (notification, manager) => {
        manager.guardiansManager.declineGuardian(notification.data.metadata.pk, () => {
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
    [NotificationTypes.recoverySetup.invite]: [
        acceptRecoveryPlanInviteAction,
        declineRecoveryPlanInviteAction,
    ],
    [NotificationTypes.recoverySetup.accept]: [
        dismissAction
    ],
    [NotificationTypes.recoverySetup.decline]: [
        dismissAction
    ],
}

export default notificationActionsMap;
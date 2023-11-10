import Notification, { NotificationTypes } from './Notification';
import NotificationsManager from '../managers/NotificationsManager';
import VaultManager from '../managers/VaultManager';

type NotificationAction = {
    title: string,
    action: (notification: Notification, manager: VaultManager) => void
}

const consoleLogAction: NotificationAction = {
    title: 'Console Log',
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
    [NotificationTypes.app.alert]: [consoleLogAction, dismissAction],
    [NotificationTypes.contact.request]: [
        consoleLogAction,
        acceptContactRequestAction,
        dismissAction
    ],
    [NotificationTypes.contact.accept]: [
        consoleLogAction,
        dismissAction
    ],
    [NotificationTypes.recoverySetup.invite]: [
        consoleLogAction,
        acceptRecoveryPlanInviteAction,
        declineRecoveryPlanInviteAction,
    ],
    [NotificationTypes.recoverySetup.accept]: [
        consoleLogAction,
        dismissAction
    ],
    [NotificationTypes.recoverySetup.decline]: [
        consoleLogAction,
        dismissAction
    ],
}

export default notificationActionsMap;
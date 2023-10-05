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

const notificationActionsMap: {[key: string]: NotificationAction[]} = {
    [NotificationTypes.app.alert]: [consoleLogAction, dismissAction],
    [NotificationTypes.contact.request]: [consoleLogAction, acceptContactRequestAction, dismissAction],
    [NotificationTypes.contact.accept]: [consoleLogAction, dismissAction],
}

export default notificationActionsMap;
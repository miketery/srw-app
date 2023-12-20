import Notification, { NotificationTypes } from './Notification';
import VaultManager from '../managers/VaultManager';
import tw from '../lib/tailwind';

const acceptStyle = {
    text: tw`text-white`,
    background: tw`bg-green-800`
}
const declineStyle = {
    text: tw`text-white`,
    background: tw`bg-red-700`
}
const defaultStyle = {
    text: tw`text-white`,
    background: tw`bg-blue-700`
}

export type NotificationAction = {
    id: string,
    title: string,
    style?: {text?: any, background?: any},
    action: (notification: Notification, manager: VaultManager) => void
}

export const consoleLogAction: NotificationAction = {
    id: 'consoleLogAction',
    title: 'dev',
    style: {text: tw`text-red-500 font-bold font-mono`, background: tw`bg-slate-400 border border-red-400`},
    action: (notification) => console.log(notification)    
}
const dismissAction: NotificationAction = {
    id: 'dismissAction',
    title: 'Dismiss',
    style: defaultStyle,
    action: (notification, manager) => manager.notificationsManager.deleteNotification(notification)
}
const acceptContactRequestAction: NotificationAction = {
    id: 'acceptContactRequestAction',
    title: 'Accept',
    style: acceptStyle,
    action: (notification, manager) => {
        manager.contactsManager.acceptContactRequest(notification.data.metadata.did, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}

const acceptRecoverSplitInviteAction: NotificationAction = {
    id: 'acceptRecoverSplitInviteAction',
    title: 'Accept',
    style: acceptStyle,
    action: (notification, manager) => {
        manager.guardiansManager.acceptGuardian(notification.data.metadata.pk, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}
const declineRecoverSplitInviteAction: NotificationAction = {
    id: 'declineRecoverSplitInviteAction',
    title: 'Decline',
    style: declineStyle,
    action: (notification, manager) => {
        manager.guardiansManager.declineGuardian(notification.data.metadata.pk, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}

const acceptRecoverCombineRequestAction: NotificationAction = {
    id: 'acceptRecoverCombineRequestAction',
    title: 'Accept',
    style: acceptStyle,
    action: (notification, manager) => {
        manager.guardiansManager.respondRecoverCombine('accept', notification.data.metadata, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}

const declineRecoverCombineRequestAction: NotificationAction = {
    id: 'declineRecoverCombineRequestAction',
    title: 'Decline',
    style: declineStyle,
    action: (notification, manager) => {
        manager.guardiansManager.respondRecoverCombine('decline', notification.data.metadata, () => {
            manager.notificationsManager.deleteNotification(notification);
        })
    }
}

const notificationActionsMap: {[key: string]: NotificationAction[]} = {
    [NotificationTypes.app.alert]: [dismissAction],
    [NotificationTypes.app.info]: [dismissAction],
    [NotificationTypes.app.test]: [dismissAction],
    [NotificationTypes.app.warning]: [dismissAction],
    [NotificationTypes.contact.request]: [
        acceptContactRequestAction,
        dismissAction // TODO: declineContactRequestAction
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
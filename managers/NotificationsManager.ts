import { v4 as uuidv4 } from 'uuid';

import SS, { StoredType } from "../services/StorageService";
import Vault from "../models/Vault";
import Notification, { NotificationData } from "../models/Notification";
import TypeManager from './TypeManager';

type NotificationCallBack = (notifications: Notification[]) => void;
export type CreateNotification = (type: string, data: NotificationData, save?: boolean) => Promise<Notification>;

class NotificationsManager extends TypeManager<Notification> {
    private _callbacks: {string?: NotificationCallBack}

    constructor(vault: Vault) {
        console.log('[NotificationsManager.constructor] ' + vault.pk)
        super(vault, {}, StoredType.notification, Notification)
        this._callbacks = {};
    }
    async createNotification(type: string, data: NotificationData, save=true): Promise<Notification> {
        console.log('[NotificationsManager.createNotification] ' + type)
        const notification = Notification.create(this.vault.pk, type, data);
        if(save)
            await this.saveNotification(notification);
        this.emitCallbacks();
        return notification;
    }
    async delete(notification: Notification): Promise<void> {
        // await SS.delete(notification.pk);
        // delete this.[notification.pk];
        await super.delete(notification);
        this.emitCallbacks();
    }
    deleteNotification = this.delete
    saveNotification = this.save
    // async saveNotification(notification: Notification): Promise<void> {
    //     await SS.save(notification.pk, notification.toDict())
    //     this._notifications[notification.pk] = notification;
    // }
    loadNotifications = this.load
    // async loadNotifications(): Promise<void> {
    //     console.log('[NotificationsManager.loadNotifications]')
    //     const notifications = {};
    //     const data = await SS.getAll(StoredType.notification, this._vault.pk);
    //     for (let notification_data of Object.values(data)) {
    //         const n = Notification.fromDict(notification_data);
    //         notifications[n.pk] = n;
    //     }
    //     this._notifications = notifications;
    // }
    getNotificationsArray = this.getAllArray
    get notifications() {
        return this.getAll();
    }
    addCallback(callback: NotificationCallBack) {
        const uuid = uuidv4();
        this._callbacks[uuid] = callback;
        return uuid;
    }
    removeCallback(uuid: string) {
        delete this._callbacks[uuid];
    }
    emitCallbacks(): void {
        const notifications = this.getNotificationsArray();
        for (let callback of Object.values(this._callbacks)) {
            callback(notifications);
        }
    }
}

export default NotificationsManager;
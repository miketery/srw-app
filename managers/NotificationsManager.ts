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
    loadNotifications = this.load
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
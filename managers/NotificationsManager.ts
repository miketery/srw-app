import { v4 as uuidv4 } from 'uuid';

import SS, { StoredType } from "../services/StorageService";
import Vault from "../models/Vault";
import Notification from "../models/Notification";

type NotificationCallBack = (notifications: Notification[]) => void;

class NotificationsManager {
    private _notifications: { [key: string]: Notification|any };
    private _vault: Vault;
    private _fetchInterval: any;
    private _callbacks: {string?: NotificationCallBack}

    constructor(vault: Vault) {
        console.log('[NotificationsManager.constructor]')
        this._vault = vault;
        this._notifications = {};
        this._callbacks = {};
    }
    clear() { this._notifications = {}; }
    async createNotification(type: string, data: any, save=true): Promise<Notification> {
        const notification = Notification.create(this._vault.pk, type, data);
        if(save)
            await this.saveNotification(notification);
        this.emitCallbacks();
        return notification;
    }
    async deleteNotification(notification: Notification): Promise<void> {
        await SS.delete(notification.pk);
        delete this._notifications[notification.pk];
    }
    async saveNotification(notification: Notification): Promise<void> {
        await SS.save(notification.pk, notification.toDict())
        this._notifications[notification.pk] = notification;
    }
    async loadNotifications(): Promise<void> {
        console.log('[NotificationsManager.loadNotifications]')
        const notifications = {};
        const data = await SS.getAll(StoredType.notification, this._vault.pk);
        for (let notification_data of Object.values(data)) {
            const n = Notification.fromDict(notification_data);
            notifications[n.pk] = n;
        }
        this._notifications = notifications;
    }
    removeNotification(notification: Notification) {
        delete this._notifications[notification.pk];
    }
    getNotificationsArray() {
        return Object.values(this._notifications);
    }
    get notifications() {
        return this._notifications;
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
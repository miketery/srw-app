import { v4 as uuidv4 } from 'uuid';

import SS, { StoredType } from "../services/StorageService";
import eventEmitter from '../services/eventService';
import Vault from "../models/Vault";
import Notification from "../models/Notification";

class NotificationsManager {
    private _notifications: { [key: string]: Notification|any };
    private _vault: Vault;
    private _fetchInterval: any;

    constructor(vault: Vault) {
        console.log('[NotificationsManager.constructor]')
        this._vault = vault;
    }
    startFetchInterval(setNotifications: ([]: Notification[]) => void): any {
        this._fetchInterval = setInterval(() => {
            this.fetch();
            setNotifications(this.getNotificationsArray());
        }, 1500);
        return this._fetchInterval
    }
    async fetch(): Promise<void> {
        // random number integr 0 or 1
        const random = Math.floor(Math.random() * 2);
        console.log('[NotificationsManager.fetch] random: ', random)
        if(random == 0) {
            return Promise.resolve();
        } else {
            // random date between 1970 and now
            const random_date = new Date(Math.floor(Math.random() * Date.now()));
            const date_formatted = random_date.toISOString();
            // TODO: Notification.fromDict(ABC)
            const uuid = uuidv4();
            this._notifications[uuid] = {
                pk: uuid,
                vault_pk: this._vault.pk,
                type: 'app.info',
                data: 'some data' + date_formatted
            };
            // update notification context
        }
    }
    clear() { this._notifications = {}; }
    async createNotification(type: string, data: any, save=true): Promise<Notification> {
        const notification = Notification.create(this._vault.pk, type, data);
        if(save)
            await this.saveNotification(notification);
        eventEmitter.emit('newNotification', this.getNotificationsArray());
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
}

export default NotificationsManager;
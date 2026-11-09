import { makeAutoObservable } from "mobx"
import { notificationApi } from "@/shared/api"

export class NotificationStore {
    unreadCount = 0

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    setUnreadCount(count) {
        this.unreadCount = Math.max(0, count)
    }

    decrement() {
        this.setUnreadCount(this.unreadCount - 1)
    }

    reset() {
        this.unreadCount = 0
    }

    refresh() {
        return notificationApi
            .getUnreadCount()
            .then(this.setUnreadCount)
            .catch(() => {})
    }
}

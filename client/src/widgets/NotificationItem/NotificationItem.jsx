import { formatRelative } from "@/shared/utils"
import styles from "./NotificationItem.module.css"

const ICONS = {
    check: "M5 12l5 5L20 7",
    cross: "M6 6l12 12M18 6 6 18",
    hidden: "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c5 0 9 4.5 10 7a13 13 0 0 1-3 4.2M6.6 6.6C4.4 8 2.9 10.1 2 12c1 2.5 5 7 10 7a9.7 9.7 0 0 0 5.4-1.6",
    flag: "M5 21V4M5 4h11l-2 4 2 4H5",
    star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9z",
    user: "M16 21a6 6 0 0 0-12 0M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M16 11l2 2 4-4",
    unlock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.5-2"
}

const TYPE_VIEW = {
    review_published: { icon: "check", tone: "success" },
    review_rejected: { icon: "cross", tone: "danger" },
    review_hidden: { icon: "hidden", tone: "danger" },
    complaint_resolved: { icon: "flag", tone: "primary" },
    course_new_review: { icon: "star", tone: "primary" },
    teacher_approved: { icon: "user", tone: "success" },
    account_unblocked: { icon: "unlock", tone: "success" }
}

export function NotificationItem({ notification, onOpen, compact = false }) {
    const view = TYPE_VIEW[notification.type] || TYPE_VIEW.complaint_resolved
    const className = [styles.item, notification.isRead ? "" : styles.unread, compact ? styles.compact : ""].join(" ")

    return (
        <button type="button" className={className} onClick={() => onOpen(notification)}>
            <span className={`${styles.icon} ${styles[view.tone]}`} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[view.icon]} />
                </svg>
            </span>
            <span className={styles.body}>
                <span className={styles.title}>
                    {!notification.isRead && <span className="visually-hidden">Новое: </span>}
                    {notification.title}
                </span>
                {notification.message && <span className={styles.message}>{notification.message}</span>}
                <time className={styles.time} dateTime={notification.createdAt}>
                    {formatRelative(notification.createdAt)}
                </time>
            </span>
            {!notification.isRead && <span className={styles.dot} aria-hidden="true" />}
        </button>
    )
}

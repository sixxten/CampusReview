import { useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Link, useNavigate } from "react-router-dom"
import { useStores } from "@/store"
import { notificationApi, parseApiError } from "@/shared/api"
import { profileTabRoute } from "@/shared/consts"
import { Spinner } from "@/ui/Spinner"
import { NotificationItem } from "@/widgets/NotificationItem"
import styles from "./NotificationBell.module.css"

const POLL_INTERVAL = 30000
const PREVIEW_LIMIT = 6

export const NotificationBell = observer(({ className = "", onOpen }) => {
    const { notificationStore } = useStores()
    const navigate = useNavigate()
    const rootRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        notificationStore.refresh()
        const timer = setInterval(notificationStore.refresh, POLL_INTERVAL)
        window.addEventListener("focus", notificationStore.refresh)
        return () => {
            clearInterval(timer)
            window.removeEventListener("focus", notificationStore.refresh)
            notificationStore.reset()
        }
    }, [notificationStore])

    useEffect(() => {
        if (!open) return
        const handlePointer = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false)
        }
        const handleKey = (event) => {
            if (event.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", handlePointer)
        document.addEventListener("keydown", handleKey)
        return () => {
            document.removeEventListener("mousedown", handlePointer)
            document.removeEventListener("keydown", handleKey)
        }
    }, [open])

    const handleToggle = () => {
        if (open) {
            setOpen(false)
            return
        }
        setOpen(true)
        setItems(null)
        setError("")
        onOpen?.()
        notificationApi
            .getMy({ limit: PREVIEW_LIMIT })
            .then((data) => {
                setItems(data.notifications)
                notificationStore.setUnreadCount(data.unreadCount)
            })
            .catch((err) => {
                setItems([])
                setError(parseApiError(err).message)
            })
    }

    const handleOpenItem = (notification) => {
        setOpen(false)
        if (!notification.isRead) {
            notificationApi
                .markRead(notification.id)
                .then(notificationStore.decrement)
                .catch(() => {})
        }
        if (notification.link) navigate(notification.link)
    }

    const handleReadAll = () => {
        notificationApi
            .markAllRead()
            .then(() => {
                setItems((prev) => prev?.map((item) => ({ ...item, isRead: true })) ?? prev)
                notificationStore.reset()
            })
            .catch((err) => setError(parseApiError(err).message))
    }

    const count = notificationStore.unreadCount
    const label = count ? `Уведомления, непрочитанных: ${count}` : "Уведомления"

    return (
        <div className={`${styles.bell} ${className}`} ref={rootRef}>
            <button
                type="button"
                className={`${styles.button} ${open ? styles.buttonActive : ""}`}
                aria-label={label}
                title="Уведомления"
                aria-expanded={open}
                aria-controls="notifications-panel"
                onClick={handleToggle}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                </svg>
                {count > 0 && (
                    <span className={styles.counter} aria-hidden="true">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>

            {open && (
                <div id="notifications-panel" className={styles.panel} role="dialog" aria-label="Уведомления">
                    <div className={styles.panelHeader}>
                        <h2 className={styles.panelTitle}>Уведомления</h2>
                        {count > 0 && (
                            <button type="button" className={styles.textButton} onClick={handleReadAll}>
                                Прочитать все
                            </button>
                        )}
                    </div>

                    <div className={styles.panelBody}>
                        {error && <p className={styles.error}>{error}</p>}
                        {items === null ? (
                            <div className={styles.state}>
                                <Spinner size="sm" />
                            </div>
                        ) : items.length === 0 ? (
                            !error && <p className={styles.state}>Пока уведомлений нет</p>
                        ) : (
                            <ul className={styles.list}>
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <NotificationItem notification={item} onOpen={handleOpenItem} compact />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Link to={profileTabRoute("notifications")} className={styles.footer} onClick={() => setOpen(false)}>
                        Все уведомления
                    </Link>
                </div>
            )}
        </div>
    )
})

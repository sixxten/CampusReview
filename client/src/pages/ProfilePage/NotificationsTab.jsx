import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigate } from "react-router-dom"
import { useStores } from "@/store"
import { notificationApi, parseApiError } from "@/shared/api"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Chip } from "@/ui/Chip"
import { Spinner } from "@/ui/Spinner"
import { NotificationItem } from "@/widgets/NotificationItem"
import styles from "./ProfilePage.module.css"

const PAGE_SIZE = 10

const FILTERS = [
    { value: "all", label: "Все" },
    { value: "unread", label: "Непрочитанные" }
]

const EMPTY_RESULT = { key: null, items: [], page: 1, pages: 1, total: 0 }

export const NotificationsTab = observer(() => {
    const { notificationStore } = useStores()
    const navigate = useNavigate()
    const [filter, setFilter] = useState("all")
    const [result, setResult] = useState(EMPTY_RESULT)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        let ignore = false
        notificationApi
            .getMy({ unread: filter === "unread" || undefined, page: 1, limit: PAGE_SIZE })
            .then((data) => {
                if (ignore) return
                setResult({ key: filter, items: data.notifications, page: data.page, pages: data.pages, total: data.total })
                setError("")
                notificationStore.setUnreadCount(data.unreadCount)
            })
            .catch((err) => {
                if (ignore) return
                setResult({ ...EMPTY_RESULT, key: filter })
                setError(parseApiError(err).message)
            })
        return () => {
            ignore = true
        }
    }, [filter, notificationStore])

    const loading = result.key !== filter

    const handleLoadMore = () => {
        setLoadingMore(true)
        notificationApi
            .getMy({ unread: filter === "unread" || undefined, page: result.page + 1, limit: PAGE_SIZE })
            .then((data) => {
                setResult((prev) => {
                    const known = new Set(prev.items.map((item) => item.id))
                    const fresh = data.notifications.filter((item) => !known.has(item.id))
                    return { ...prev, items: [...prev.items, ...fresh], page: data.page, pages: data.pages }
                })
            })
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoadingMore(false))
    }

    const markLocal = (predicate) => {
        setResult((prev) => ({
            ...prev,
            items: prev.items.map((item) => (predicate(item) ? { ...item, isRead: true } : item))
        }))
    }

    const handleOpen = (notification) => {
        if (!notification.isRead) {
            markLocal((item) => item.id === notification.id)
            notificationApi
                .markRead(notification.id)
                .then(notificationStore.decrement)
                .catch(() => {})
        }
        if (notification.link) navigate(notification.link)
    }

    const handleReadAll = () => {
        setError("")
        notificationApi
            .markAllRead()
            .then(() => {
                markLocal(() => true)
                notificationStore.reset()
            })
            .catch((err) => setError(parseApiError(err).message))
    }

    const unread = notificationStore.unreadCount

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabToolbar}>
                <div className={styles.filterChips} role="group" aria-label="Какие уведомления показать">
                    {FILTERS.map((item) => (
                        <Chip key={item.value} active={filter === item.value} onClick={() => setFilter(item.value)}>
                            {item.value === "unread" ? `${item.label} · ${unread}` : item.label}
                        </Chip>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleReadAll} disabled={unread === 0}>
                    Прочитать все
                </Button>
            </div>

            {error && <Alert tone="danger">{error}</Alert>}

            {loading ? (
                <div className={styles.loader}>
                    <Spinner />
                </div>
            ) : result.items.length === 0 ? (
                <Card className={styles.empty}>
                    <h2>{filter === "unread" ? "Все уведомления прочитаны" : "Уведомлений пока нет"}</h2>
                    <p className={styles.muted}>
                        Здесь появятся новости о ваших отзывах, жалобах и аккаунте.
                    </p>
                </Card>
            ) : (
                <>
                    <ul className={styles.notificationList}>
                        {result.items.map((item) => (
                            <li key={item.id}>
                                <NotificationItem notification={item} onOpen={handleOpen} />
                            </li>
                        ))}
                    </ul>
                    {result.page < result.pages && (
                        <Button variant="outline" className={styles.loadMore} onClick={handleLoadMore} loading={loadingMore}>
                            Показать ещё
                        </Button>
                    )}
                </>
            )}
        </div>
    )
})

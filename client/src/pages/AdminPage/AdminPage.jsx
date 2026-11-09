import { useEffect, useState } from "react"
import { adminApi } from "@/shared/api"
import { ComplaintsTab } from "./ComplaintsTab"
import { CoursesTab } from "./CoursesTab"
import { ReviewsTab } from "./ReviewsTab"
import { UsersTab } from "./UsersTab"
import styles from "./AdminPage.module.css"

const TABS = [
    { id: "reviews", label: "Отзывы", counter: "pendingReviews" },
    { id: "complaints", label: "Жалобы", counter: "pendingComplaints" },
    { id: "courses", label: "Курсы", counter: "pendingCourses" },
    { id: "users", label: "Пользователи", counter: "pendingTeachers" }
]

export function AdminPage() {
    const [tab, setTab] = useState("reviews")
    const [stats, setStats] = useState({ pendingReviews: 0, pendingComplaints: 0, pendingCourses: 0, pendingTeachers: 0 })
    const [statsKey, setStatsKey] = useState(0)

    useEffect(() => {
        let ignore = false
        adminApi
            .getStats()
            .then((result) => {
                if (!ignore) setStats(result)
            })
            .catch(() => {})
        return () => {
            ignore = true
        }
    }, [statsKey])

    const refreshStats = () => setStatsKey((key) => key + 1)

    return (
        <div className={`container ${styles.page}`}>
            <h1>Админ-панель</h1>

            <div className={styles.tabs} role="tablist" aria-label="Разделы админ-панели">
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        id={`tab-${item.id}`}
                        aria-selected={tab === item.id}
                        aria-controls={`panel-${item.id}`}
                        className={`${styles.tab} ${tab === item.id ? styles.tabActive : ""}`}
                        onClick={() => setTab(item.id)}
                    >
                        {item.label}
                        {stats[item.counter] > 0 && (
                            <span className={styles.tabCount}>
                                <span className="visually-hidden">ожидают решения: </span>
                                {stats[item.counter]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                {tab === "reviews" && <ReviewsTab onChanged={refreshStats} />}
                {tab === "complaints" && <ComplaintsTab onChanged={refreshStats} />}
                {tab === "courses" && <CoursesTab onChanged={refreshStats} />}
                {tab === "users" && <UsersTab onChanged={refreshStats} />}
            </div>
        </div>
    )
}

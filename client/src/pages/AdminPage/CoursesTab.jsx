import { useEffect, useState } from "react"
import { adminApi, parseApiError } from "@/shared/api"
import { useDebouncedValue } from "@/shared/hooks"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Input } from "@/ui/Input"
import { Select } from "@/ui/Select"
import { Spinner } from "@/ui/Spinner"
import { CourseModerationCard } from "./CourseModerationCard"
import styles from "./AdminPage.module.css"

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
    { value: "pending", label: "На модерации" },
    { value: "published", label: "Опубликованные" },
    { value: "rejected", label: "Отклонённые" }
]

const EMPTY_TEXT = {
    pending: "Новых курсов на проверку нет",
    published: "Опубликованных курсов не нашлось",
    rejected: "Отклонённых курсов не нашлось"
}

export function CoursesTab({ onChanged }) {
    const [filters, setFilters] = useState({ search: "", status: "pending" })
    const [page, setPage] = useState(1)
    const [data, setData] = useState({ courses: [], total: 0, pages: 1 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [busyId, setBusyId] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)

    const search = useDebouncedValue(filters.search.trim())

    useEffect(() => {
        let ignore = false
        adminApi
            .getCourses({ search: search || undefined, status: filters.status, page, limit: PAGE_SIZE })
            .then((result) => {
                if (ignore) return
                setData(result)
                setError("")
            })
            .catch((err) => {
                if (ignore) return
                const { message, fieldErrors } = parseApiError(err)
                setError(Object.values(fieldErrors)[0] || message)
                setData({ courses: [], total: 0, pages: 1 })
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [search, filters.status, page, reloadKey])

    const updateFilter = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }))
        setPage(1)
        setLoading(true)
    }

    const goToPage = (number) => {
        setPage(number)
        setLoading(true)
    }

    const moderate = async (course, decision) => {
        setBusyId(course.id)
        setError("")
        try {
            await adminApi.moderateCourse(course.id, decision)
            setReloadKey((key) => key + 1)
            onChanged()
            return true
        } catch (err) {
            const { message, fieldErrors } = parseApiError(err)
            setError(Object.values(fieldErrors)[0] || message)
            return false
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className={styles.tabContent}>
            <Card className={styles.reviewFilters}>
                <Input
                    type="search"
                    label="Поиск"
                    placeholder="Название курса или преподаватель"
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                />
                <Select
                    label="Статус"
                    value={filters.status}
                    onChange={(event) => updateFilter("status", event.target.value)}
                    options={STATUS_OPTIONS}
                />
            </Card>

            {error && <Alert tone="danger">{error}</Alert>}

            <section className={styles.results} aria-label="Курсы" aria-busy={loading}>
                <p className={styles.count}>Найдено: {data.total}</p>

                {loading && data.courses.length === 0 ? (
                    <div className={styles.loader}>
                        <Spinner />
                    </div>
                ) : data.courses.length > 0 ? (
                    <div className={styles.moderationList}>
                        {data.courses.map((course) => (
                            <CourseModerationCard
                                key={course.id}
                                course={course}
                                busy={busyId === course.id}
                                onModerate={moderate}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className={styles.empty}>{search ? "Ничего не нашлось" : EMPTY_TEXT[filters.status]}</Card>
                )}

                {data.pages > 1 && (
                    <nav className={styles.pagination} aria-label="Страницы">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                            Назад
                        </Button>
                        <span className={styles.pageInfo}>
                            Страница {page} из {data.pages}
                        </span>
                        <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => goToPage(page + 1)}>
                            Вперёд
                        </Button>
                    </nav>
                )}
            </section>
        </div>
    )
}

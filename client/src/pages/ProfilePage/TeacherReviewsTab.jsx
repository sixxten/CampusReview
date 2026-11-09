import { useEffect, useState } from "react"
import { parseApiError, teacherApi } from "@/shared/api"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Chip } from "@/ui/Chip"
import { Select } from "@/ui/Select"
import { Spinner } from "@/ui/Spinner"
import { TeacherReviewItem } from "./TeacherReviewItem"
import styles from "./ProfilePage.module.css"

const PAGE_SIZE = 10

const REPLY_FILTERS = [
    { value: "", label: "Все" },
    { value: "no", label: "Без ответа" },
    { value: "yes", label: "С ответом" }
]

const EMPTY_RESULT = { key: null, items: [], page: 1, pages: 1, total: 0 }

export function TeacherReviewsTab({ courseId, replied, canReply, onFiltersChange }) {
    const [courses, setCourses] = useState([])
    const [result, setResult] = useState(EMPTY_RESULT)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState("")

    const key = `${courseId}|${replied}`

    useEffect(() => {
        let ignore = false
        teacherApi
            .getCourses()
            .then((data) => {
                if (!ignore) setCourses(data.courses)
            })
            .catch(() => {})
        return () => {
            ignore = true
        }
    }, [])

    useEffect(() => {
        let ignore = false
        teacherApi
            .getReviews({ courseId: courseId || undefined, replied: replied || undefined, page: 1, limit: PAGE_SIZE })
            .then((data) => {
                if (ignore) return
                setResult({ key, items: data.reviews, page: data.page, pages: data.pages, total: data.total })
                setError("")
            })
            .catch((err) => {
                if (ignore) return
                setResult({ ...EMPTY_RESULT, key })
                setError(parseApiError(err).message)
            })
        return () => {
            ignore = true
        }
    }, [key, courseId, replied])

    const loading = result.key !== key

    const handleLoadMore = () => {
        setLoadingMore(true)
        teacherApi
            .getReviews({ courseId: courseId || undefined, replied: replied || undefined, page: result.page + 1, limit: PAGE_SIZE })
            .then((data) => {
                setResult((prev) => {
                    const known = new Set(prev.items.map((item) => item.id))
                    const fresh = data.reviews.filter((item) => !known.has(item.id))
                    return { ...prev, items: [...prev.items, ...fresh], page: data.page, pages: data.pages }
                })
            })
            .catch((err) => setError(parseApiError(err).message))
            .finally(() => setLoadingMore(false))
    }

    const handleChange = (updated) => {
        setResult((prev) => ({ ...prev, items: prev.items.map((item) => (item.id === updated.id ? updated : item)) }))
    }

    const courseOptions = [{ value: "", label: "Все курсы" }, ...courses.map((course) => ({ value: String(course.id), label: course.title }))]

    return (
        <div className={styles.tabContent}>
            {!canReply && (
                <Alert tone="warning">Отвечать на отзывы можно после подтверждения аккаунта администратором.</Alert>
            )}

            <div className={styles.tabToolbar}>
                <Select
                    className={styles.courseSelect}
                    aria-label="Курс"
                    value={courseId}
                    onChange={(event) => onFiltersChange({ course: event.target.value, replied })}
                    options={courseOptions}
                />
                <div className={styles.filterChips} role="group" aria-label="Фильтр по ответу">
                    {REPLY_FILTERS.map((item) => (
                        <Chip key={item.value} active={replied === item.value} onClick={() => onFiltersChange({ course: courseId, replied: item.value })}>
                            {item.label}
                        </Chip>
                    ))}
                </div>
            </div>

            {error && <Alert tone="danger">{error}</Alert>}

            {loading ? (
                <div className={styles.loader}>
                    <Spinner />
                </div>
            ) : result.items.length === 0 ? (
                <Card className={styles.empty}>
                    <h2>{replied === "no" ? "Вы ответили на все отзывы" : "Отзывов пока нет"}</h2>
                    <p className={styles.muted}>Здесь появляются опубликованные отзывы студентов о ваших курсах.</p>
                </Card>
            ) : (
                <>
                    <p className={styles.muted}>Найдено отзывов: {result.total}</p>
                    <ul className={styles.reviewList}>
                        {result.items.map((review) => (
                            <TeacherReviewItem key={review.id} review={review} canReply={canReply} onChange={handleChange} />
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
}

import { useEffect, useState } from "react"
import { courseApi, parseApiError, reviewApi } from "@/shared/api"
import { REVIEW_SORT_OPTIONS } from "@/shared/consts"
import { plural } from "@/shared/utils"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Checkbox } from "@/ui/Checkbox"
import { Select } from "@/ui/Select"
import { Spinner } from "@/ui/Spinner"
import { MyReviewButton } from "./MyReviewButton"
import { ReviewCard } from "./ReviewCard"
import styles from "./CoursePage.module.css"

const PAGE_SIZE = 5

const INITIAL_FILTERS = { rating: "", semesterId: "", withText: false, sort: "new" }

const RATING_OPTIONS = [
    { value: "", label: "Любая оценка" },
    ...[5, 4, 3, 2, 1].map((score) => ({ value: String(score), label: `Оценка ${score}` }))
]

export function CourseReviews({ courseId }) {
    const [filters, setFilters] = useState(INITIAL_FILTERS)
    const [page, setPage] = useState(1)
    const [semesters, setSemesters] = useState([])
    const [data, setData] = useState({ reviews: [], total: 0, pages: 1 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        courseApi
            .getFilterOptions()
            .then((options) => setSemesters(options.semesters))
            .catch(() => {})
    }, [])

    useEffect(() => {
        let ignore = false
        reviewApi
            .getCourseReviews(courseId, {
                rating: filters.rating || undefined,
                semesterId: filters.semesterId || undefined,
                withText: filters.withText || undefined,
                sort: filters.sort,
                page,
                limit: PAGE_SIZE
            })
            .then((result) => {
                if (ignore) return
                setData(result)
                setError("")
            })
            .catch((err) => {
                if (ignore) return
                setError(parseApiError(err).message)
                setData({ reviews: [], total: 0, pages: 1 })
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [courseId, filters, page])

    const updateFilter = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }))
        setPage(1)
        setLoading(true)
    }

    const goToPage = (number) => {
        setPage(number)
        setLoading(true)
    }

    const resetFilters = () => {
        setFilters(INITIAL_FILTERS)
        setPage(1)
        setLoading(true)
    }

    const hasFilters = filters.rating || filters.semesterId || filters.withText

    return (
        <Card as="section" className={styles.section} aria-labelledby="reviews-title">
            <div className={styles.reviewsHeading}>
                <h2 id="reviews-title">
                    Отзывы {data.total > 0 && <span className={styles.muted}>· {data.total}</span>}
                </h2>
                <MyReviewButton courseId={courseId} />
            </div>

            <div className={styles.reviewFilters}>
                <Select
                    aria-label="Фильтр по оценке"
                    value={filters.rating}
                    onChange={(event) => updateFilter("rating", event.target.value)}
                    options={RATING_OPTIONS}
                />
                <Select
                    aria-label="Фильтр по семестру"
                    value={filters.semesterId}
                    onChange={(event) => updateFilter("semesterId", event.target.value)}
                    options={[
                        { value: "", label: "Все семестры" },
                        ...semesters.map((semester) => ({ value: String(semester.id), label: semester.name }))
                    ]}
                />
                <Select
                    aria-label="Сортировка отзывов"
                    value={filters.sort}
                    onChange={(event) => updateFilter("sort", event.target.value)}
                    options={REVIEW_SORT_OPTIONS}
                />
                <Checkbox
                    label="Только с текстом"
                    checked={filters.withText}
                    onChange={(event) => updateFilter("withText", event.target.checked)}
                />
            </div>

            {error && <Alert tone="danger">{error}</Alert>}

            {loading && data.reviews.length === 0 ? (
                <div className={styles.listLoader}>
                    <Spinner />
                </div>
            ) : data.reviews.length > 0 ? (
                <div className={styles.reviewList} aria-busy={loading}>
                    {data.reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            ) : (
                !error && (
                    <div className={styles.reviewsEmpty}>
                        <p className={styles.muted}>
                            {hasFilters ? "Нет отзывов с такими фильтрами." : "Отзывов пока нет. Станьте первым!"}
                        </p>
                        {hasFilters && (
                            <Button variant="outline" size="sm" onClick={resetFilters}>
                                Сбросить фильтры
                            </Button>
                        )}
                    </div>
                )
            )}

            {data.pages > 1 && (
                <nav className={styles.pagination} aria-label="Страницы отзывов">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                        Назад
                    </Button>
                    <span className={styles.muted}>
                        {page} из {data.pages} · {data.total} {plural(data.total, ["отзыв", "отзыва", "отзывов"])}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => goToPage(page + 1)}>
                        Вперёд
                    </Button>
                </nav>
            )}
        </Card>
    )
}

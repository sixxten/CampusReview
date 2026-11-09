import { useEffect, useState } from "react"
import { parseApiError, reviewApi } from "@/shared/api"
import { REVIEW_STATUS_LABELS, ROUTES } from "@/shared/consts"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Chip } from "@/ui/Chip"
import { Spinner } from "@/ui/Spinner"
import { MyReviewItem } from "./MyReviewItem"
import styles from "./ProfilePage.module.css"

const FILTERS = [{ value: "", label: "Все" }, ...Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => ({ value, label }))]

export function MyReviewsTab() {
    const [reviews, setReviews] = useState(null)
    const [status, setStatus] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        let ignore = false
        reviewApi
            .getMy()
            .then((result) => {
                if (!ignore) setReviews(result)
            })
            .catch((err) => {
                if (!ignore) {
                    setError(parseApiError(err).message)
                    setReviews([])
                }
            })
        return () => {
            ignore = true
        }
    }, [])

    const handleDelete = async (review) => {
        setError("")
        try {
            await reviewApi.remove(review.id)
            setReviews((prev) => prev.filter((item) => item.id !== review.id))
            return true
        } catch (err) {
            setError(parseApiError(err).message)
            return false
        }
    }

    if (reviews === null) {
        return (
            <div className={styles.loader}>
                <Spinner />
            </div>
        )
    }

    const countBy = (value) => (value ? reviews.filter((review) => review.status === value).length : reviews.length)
    const visible = status ? reviews.filter((review) => review.status === status) : reviews

    return (
        <div className={styles.tabContent}>
            {error && <Alert tone="danger">{error}</Alert>}

            {reviews.length === 0 ? (
                <Card className={styles.empty}>
                    <h2>Вы ещё не оставили ни одного отзыва</h2>
                    <p className={styles.muted}>Найдите курс, который проходили, и расскажите о нём другим студентам.</p>
                    <Button to={ROUTES.HOME}>Перейти в каталог</Button>
                </Card>
            ) : (
                <>
                    <div className={styles.filterChips} role="group" aria-label="Фильтр по статусу">
                        {FILTERS.map((filter) => (
                            <Chip key={filter.value} active={status === filter.value} onClick={() => setStatus(filter.value)}>
                                {filter.label} · {countBy(filter.value)}
                            </Chip>
                        ))}
                    </div>

                    {visible.length > 0 ? (
                        <ul className={styles.reviewList}>
                            {visible.map((review) => (
                                <MyReviewItem key={review.id} review={review} onDelete={handleDelete} />
                            ))}
                        </ul>
                    ) : (
                        <Card className={styles.empty}>
                            <p className={styles.muted}>Отзывов с таким статусом нет</p>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

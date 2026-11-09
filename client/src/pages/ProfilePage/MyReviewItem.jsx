import { useState } from "react"
import { Link } from "react-router-dom"
import { courseRoute, reviewFormRoute, REVIEW_STATUS, REVIEW_STATUS_LABELS, REVIEW_STATUS_TONE } from "@/shared/consts"
import { formatRating } from "@/shared/utils"
import { Alert } from "@/ui/Alert"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"
import styles from "./ProfilePage.module.css"

const formatDate = (value) => new Date(value).toLocaleDateString("ru-RU")

const EDIT_LABEL = {
    [REVIEW_STATUS.DRAFT]: "Продолжить",
    [REVIEW_STATUS.PENDING]: "Изменить",
    [REVIEW_STATUS.REJECTED]: "Исправить"
}

export function MyReviewItem({ review, onDelete }) {
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        const done = await onDelete(review)
        if (!done) setDeleting(false)
    }

    const preview = review.pros || review.cons || review.advice

    return (
        <li className={styles.reviewItem}>
            <div className={styles.reviewItemTop}>
                <div className={styles.reviewItemTitle}>
                    <Link to={courseRoute(review.course.id)} className={styles.courseLink}>
                        {review.course.title}
                    </Link>
                    <span className={styles.muted}>
                        {review.semester ? `${review.semester.name} · ` : ""}изменён {formatDate(review.updatedAt)}
                    </span>
                </div>
                <div className={styles.reviewItemBadges}>
                    <Badge tone={REVIEW_STATUS_TONE[review.status]}>{REVIEW_STATUS_LABELS[review.status]}</Badge>
                    {review.rating != null && (
                        <span className={styles.ratingBadge}>
                            <span className="visually-hidden">Оценка </span>
                            {formatRating(review.rating)}
                        </span>
                    )}
                </div>
            </div>

            {preview && <p className={styles.preview}>{preview}</p>}

            {review.status === REVIEW_STATUS.REJECTED && review.rejectionReason && (
                <Alert tone="warning">Причина отклонения: {review.rejectionReason}</Alert>
            )}

            <div className={styles.reviewItemActions}>
                {confirming ? (
                    <>
                        <span className={styles.muted}>Удалить отзыв без возможности восстановить?</span>
                        <Button variant="ghost" size="sm" disabled={deleting} onClick={() => setConfirming(false)}>
                            Отмена
                        </Button>
                        <Button size="sm" loading={deleting} onClick={handleDelete}>
                            Да, удалить
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                            Удалить
                        </Button>
                        {review.status === REVIEW_STATUS.PUBLISHED ? (
                            <Button variant="outline" size="sm" to={courseRoute(review.course.id)}>
                                Открыть курс
                            </Button>
                        ) : (
                            <Button size="sm" to={reviewFormRoute(review.course.id)}>
                                {EDIT_LABEL[review.status]}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </li>
    )
}

import { useState } from "react"
import { Link } from "react-router-dom"
import {
    COMPLAINT_REASON_LABELS,
    COMPLAINT_STATUS_LABELS,
    COMPLAINT_STATUS_TONE,
    courseRoute,
    REVIEW_STATUS,
    REVIEW_STATUS_LABELS,
    ROLE_LABELS
} from "@/shared/consts"
import { formatRating } from "@/shared/utils"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"
import styles from "./AdminPage.module.css"

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("ru-RU") : "")

const TEXT_BLOCKS = [
    { key: "pros", title: "Понравилось" },
    { key: "cons", title: "Не понравилось" },
    { key: "advice", title: "Совет" }
]

// Жалоба: кто, почему, и сам отзыв, на который жалуются
export function ComplaintCard({ complaint, busy, onResolve }) {
    const [clicked, setClicked] = useState(null)
    const { review, author } = complaint
    const isNew = complaint.status === "new"

    const resolve = (status) => {
        setClicked(status)
        onResolve(complaint, status)
    }

    return (
        <article className={styles.moderationCard}>
            <header className={styles.moderationHeader}>
                <div className={styles.moderationTitle}>
                    <span className={styles.complaintReason}>{COMPLAINT_REASON_LABELS[complaint.reason]}</span>
                    <span className={styles.muted}>
                        От: {author.firstName} {author.lastName} ({ROLE_LABELS[author.role].toLowerCase()}) ·{" "}
                        {formatDate(complaint.createdAt)}
                    </span>
                </div>
                <Badge tone={COMPLAINT_STATUS_TONE[complaint.status]}>{COMPLAINT_STATUS_LABELS[complaint.status]}</Badge>
            </header>

            {complaint.comment && <p className={styles.complaintComment}>«{complaint.comment}»</p>}

            {/* сам отзыв — в рамке, чтобы не путать с жалобой */}
            <div className={styles.quotedReview}>
                <div className={styles.moderationHeader}>
                    <div className={styles.moderationTitle}>
                        <Link to={courseRoute(review.course.id)} className={styles.courseLink}>
                            {review.course.title}
                        </Link>
                        <span className={styles.muted}>
                            Автор отзыва: {review.author.firstName} {review.author.lastName}
                            {review.isAnonymous && " (опубликован анонимно)"}
                        </span>
                    </div>
                    <div className={styles.moderationBadges}>
                        {review.status !== REVIEW_STATUS.PUBLISHED && (
                            <Badge tone="danger">Отзыв: {REVIEW_STATUS_LABELS[review.status].toLowerCase()}</Badge>
                        )}
                        <span className={styles.ratingBadge}>
                            <span className="visually-hidden">Оценка </span>
                            {formatRating(review.rating)}
                        </span>
                    </div>
                </div>
                {TEXT_BLOCKS.filter((block) => review[block.key]).map((block) => (
                    <div key={block.key} className={styles.reviewText}>
                        <h4>{block.title}</h4>
                        <p>{review[block.key]}</p>
                    </div>
                ))}
            </div>

            {isNew ? (
                <div className={styles.moderationActions}>
                    <Button variant="outline" disabled={busy} loading={busy && clicked === "rejected"} onClick={() => resolve("rejected")}>
                        Оставить отзыв
                    </Button>
                    <Button disabled={busy} loading={busy && clicked === "accepted"} onClick={() => resolve("accepted")}>
                        Скрыть отзыв
                    </Button>
                </div>
            ) : (
                <p className={styles.muted}>
                    Рассмотрена {formatDate(complaint.resolvedAt)} ·{" "}
                    {complaint.status === "accepted" ? "отзыв скрыт" : "отзыв оставлен"}
                </p>
            )}
        </article>
    )
}

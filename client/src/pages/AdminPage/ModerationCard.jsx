import { useState } from "react"
import { Link } from "react-router-dom"
import { courseRoute, REVIEW_CRITERIA, REVIEW_STATUS, REVIEW_STATUS_LABELS, REVIEW_STATUS_TONE } from "@/shared/consts"
import { formatRating } from "@/shared/utils"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"
import { Chip } from "@/ui/Chip"
import { Textarea } from "@/ui/Textarea"
import styles from "./AdminPage.module.css"

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("ru-RU") : "")

const QUICK_REASONS = [
    "Оскорбления или переход на личности",
    "Отзыв не относится к курсу",
    "Недостоверная информация",
    "Реклама или спам"
]

const TEXT_BLOCKS = [
    { key: "pros", title: "Понравилось" },
    { key: "cons", title: "Не понравилось" },
    { key: "advice", title: "Совет" }
]

export function ModerationCard({ review, busy, onModerate }) {
    const [rejecting, setRejecting] = useState(false)
    const [reason, setReason] = useState("")
    const [reasonError, setReasonError] = useState("")
    const [clicked, setClicked] = useState(null)

    const isPending = review.status === REVIEW_STATUS.PENDING
    const { author } = review

    const publish = () => {
        setClicked("publish")
        onModerate(review, { status: "published" })
    }

    const reject = async () => {
        if (reason.trim().length < 5) {
            setReasonError("Напишите причину — студент увидит её и сможет исправить отзыв")
            return
        }
        setClicked("reject")
        const done = await onModerate(review, { status: "rejected", rejectionReason: reason.trim() })
        if (done) setRejecting(false)
    }

    return (
        <article className={styles.moderationCard}>
            <header className={styles.moderationHeader}>
                <div className={styles.moderationTitle}>
                    <Link to={courseRoute(review.course.id)} className={styles.courseLink}>
                        {review.course.title}
                    </Link>
                    <span className={styles.muted}>
                        {author.firstName} {author.lastName} · {author.email}
                        {review.semester && ` · проходил(а): ${review.semester.name}`}
                    </span>
                </div>
                <div className={styles.moderationBadges}>
                    {review.isAnonymous && <Badge tone="neutral">Анонимно</Badge>}
                    <Badge tone={REVIEW_STATUS_TONE[review.status]}>{REVIEW_STATUS_LABELS[review.status]}</Badge>
                    <span className={styles.ratingBadge}>
                        <span className="visually-hidden">Оценка </span>
                        {formatRating(review.rating)}
                    </span>
                </div>
            </header>

            <ul className={styles.scores} aria-label="Оценки по критериям">
                {REVIEW_CRITERIA.map((criterion) => (
                    <li key={criterion.key}>
                        {criterion.label}: <strong>{review[criterion.key]}</strong>
                    </li>
                ))}
            </ul>

            {TEXT_BLOCKS.filter((block) => review[block.key]).map((block) => (
                <div key={block.key} className={styles.reviewText}>
                    <h4>{block.title}</h4>
                    <p>{review[block.key]}</p>
                </div>
            ))}

            {!isPending && (
                <p className={styles.muted}>
                    Проверен {formatDate(review.moderatedAt)}
                    {review.rejectionReason && (
                        <>
                            {" "}· причина: <strong className={styles.reason}>{review.rejectionReason}</strong>
                        </>
                    )}
                </p>
            )}

            {isPending && !rejecting && (
                <div className={styles.moderationActions}>
                    <span className={styles.muted}>Отправлен {formatDate(review.updatedAt)}</span>
                    <Button variant="outline" disabled={busy} onClick={() => setRejecting(true)}>
                        Отклонить
                    </Button>
                    <Button disabled={busy} loading={busy && clicked === "publish"} onClick={publish}>
                        Опубликовать
                    </Button>
                </div>
            )}

            {isPending && rejecting && (
                <div className={styles.rejectForm}>
                    <div className={styles.quickReasons}>
                        {QUICK_REASONS.map((item) => (
                            <Chip
                                key={item}
                                active={reason === item}
                                onClick={() => {
                                    setReason(item)
                                    setReasonError("")
                                }}
                            >
                                {item}
                            </Chip>
                        ))}
                    </div>
                    <Textarea
                        label="Причина отклонения"
                        hint="Студент увидит её в личном кабинете"
                        rows={2}
                        maxLength={500}
                        value={reason}
                        onChange={(event) => {
                            setReason(event.target.value)
                            setReasonError("")
                        }}
                        error={reasonError}
                    />
                    <div className={styles.moderationActions}>
                        <Button variant="ghost" disabled={busy} onClick={() => setRejecting(false)}>
                            Отмена
                        </Button>
                        <Button disabled={busy} loading={busy && clicked === "reject"} onClick={reject}>
                            Отклонить отзыв
                        </Button>
                    </div>
                </div>
            )}
        </article>
    )
}

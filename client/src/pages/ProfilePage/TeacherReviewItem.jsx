import { useState } from "react"
import { Link } from "react-router-dom"
import { parseApiError, teacherApi } from "@/shared/api"
import { courseRoute, REPLY_MAX, REPLY_MIN, REVIEW_CRITERIA } from "@/shared/consts"
import { formatRating } from "@/shared/utils"
import { Button } from "@/ui/Button"
import { Textarea } from "@/ui/Textarea"
import { ReviewReply } from "@/widgets/ReviewReply"
import styles from "./ProfilePage.module.css"

const formatDate = (value) => new Date(value).toLocaleDateString("ru-RU")

const TEXT_BLOCKS = [
    { key: "pros", title: "Понравилось" },
    { key: "cons", title: "Не понравилось" },
    { key: "advice", title: "Совет будущим студентам" }
]

function ReplyForm({ review, onSaved, onCancel }) {
    const [text, setText] = useState(review.reply?.text || "")
    const [error, setError] = useState("")
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (text.trim().length < REPLY_MIN) {
            setError(`Напишите хотя бы ${REPLY_MIN} символов`)
            return
        }
        setSaving(true)
        setError("")
        try {
            const reply = await teacherApi.saveReply(review.id, text.trim())
            onSaved(reply)
        } catch (err) {
            const { message, fieldErrors } = parseApiError(err)
            setError(fieldErrors.text || message)
            setSaving(false)
        }
    }

    return (
        <form className={styles.replyForm} onSubmit={handleSubmit} noValidate>
            <Textarea
                label={review.reply ? "Изменить ответ" : "Ваш ответ студенту"}
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={REPLY_MAX}
                rows={3}
                error={error}
                hint="Ответ увидят все на странице курса"
                autoFocus
            />
            <div className={styles.reviewItemActions}>
                <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
                    Отмена
                </Button>
                <Button type="submit" size="sm" loading={saving}>
                    {review.reply ? "Сохранить" : "Опубликовать ответ"}
                </Button>
            </div>
        </form>
    )
}

export function TeacherReviewItem({ review, canReply, onChange }) {
    const [editing, setEditing] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState("")

    const author = review.author ? `${review.author.firstName} ${review.author.lastName}` : "Анонимный студент"

    const handleSaved = (reply) => {
        setEditing(false)
        onChange({ ...review, reply })
    }

    const handleDelete = async () => {
        setDeleting(true)
        setError("")
        try {
            await teacherApi.removeReply(review.id)
            setConfirming(false)
            onChange({ ...review, reply: null })
        } catch (err) {
            setError(parseApiError(err).message)
        } finally {
            setDeleting(false)
        }
    }

    let replyBlock = null
    if (editing) {
        replyBlock = <ReplyForm review={review} onSaved={handleSaved} onCancel={() => setEditing(false)} />
    } else if (review.reply) {
        const actions = !canReply ? null : confirming ? (
            <>
                <span className={styles.muted}>Удалить ответ?</span>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
                    Отмена
                </Button>
                <Button size="sm" onClick={handleDelete} loading={deleting}>
                    Да, удалить
                </Button>
            </>
        ) : (
            <>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                    Удалить
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    Изменить
                </Button>
            </>
        )
        replyBlock = <ReviewReply reply={review.reply} actions={actions} />
    } else if (canReply) {
        replyBlock = (
            <div className={styles.reviewItemActions}>
                <span className={styles.muted}>Вы ещё не ответили на этот отзыв</span>
                <Button size="sm" onClick={() => setEditing(true)}>
                    Ответить
                </Button>
            </div>
        )
    }

    return (
        <li className={styles.reviewItem}>
            <div className={styles.reviewItemTop}>
                <div className={styles.reviewItemTitle}>
                    <Link to={courseRoute(review.course.id)} className={styles.courseLink}>
                        {review.course.title}
                    </Link>
                    <span className={styles.muted}>
                        {author} · {review.semester?.name || "семестр не указан"} · {formatDate(review.createdAt)}
                    </span>
                </div>
                <span className={styles.ratingBadge}>
                    <span className="visually-hidden">Оценка </span>
                    {formatRating(review.rating)}
                </span>
            </div>

            <ul className={styles.scoreList} aria-label="Оценки по критериям">
                {REVIEW_CRITERIA.map((criterion) => (
                    <li key={criterion.key}>
                        {criterion.label}: <strong>{review[criterion.key]}</strong>
                    </li>
                ))}
            </ul>

            {TEXT_BLOCKS.filter((block) => review[block.key]).map((block) => (
                <div key={block.key} className={styles.reviewBlock}>
                    <h4>{block.title}</h4>
                    <p>{review[block.key]}</p>
                </div>
            ))}

            {error && <p className={styles.errorText}>{error}</p>}
            {replyBlock}
        </li>
    )
}

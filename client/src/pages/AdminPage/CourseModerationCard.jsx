import { useState } from "react"
import { Link } from "react-router-dom"
import { COURSE_STATUS_LABELS, COURSE_STATUS_TONE, courseRoute, FORMAT_LABELS } from "@/shared/consts"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"
import { Chip } from "@/ui/Chip"
import { Textarea } from "@/ui/Textarea"
import styles from "./AdminPage.module.css"

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("ru-RU") : "")

const QUICK_REASONS = [
    "Описание слишком короткое",
    "Нет программы курса",
    "Такой курс уже есть в каталоге",
    "Название не соответствует содержанию"
]

export function CourseModerationCard({ course, busy, onModerate }) {
    const [rejecting, setRejecting] = useState(false)
    const [reason, setReason] = useState("")
    const [reasonError, setReasonError] = useState("")
    const [clicked, setClicked] = useState(null)

    const isPending = course.status === "pending"
    const { teacher } = course

    const publish = () => {
        setClicked("publish")
        onModerate(course, { status: "published" })
    }

    const reject = async () => {
        if (reason.trim().length < 5) {
            setReasonError("Напишите причину — преподаватель увидит её и сможет исправить курс")
            return
        }
        setClicked("reject")
        const done = await onModerate(course, { status: "rejected", rejectionReason: reason.trim() })
        if (done) setRejecting(false)
    }

    const changeReason = (value) => {
        setReason(value)
        setReasonError("")
    }

    return (
        <article className={styles.moderationCard}>
            <header className={styles.moderationHeader}>
                <div className={styles.moderationTitle}>
                    {course.status === "published" ? (
                        <Link to={courseRoute(course.id)} className={styles.courseLink}>
                            {course.title}
                        </Link>
                    ) : (
                        <span className={styles.courseLink}>{course.title}</span>
                    )}
                    <span className={styles.muted}>
                        {teacher.firstName} {teacher.lastName} · {teacher.email}
                    </span>
                </div>
                <div className={styles.moderationBadges}>
                    <Badge tone={COURSE_STATUS_TONE[course.status]}>{COURSE_STATUS_LABELS[course.status]}</Badge>
                </div>
            </header>

            <ul className={styles.scores} aria-label="Параметры курса">
                <li>
                    Факультет: <strong>{course.faculty?.name}</strong>
                </li>
                <li>
                    Семестр: <strong>{course.semester?.name}</strong>
                </li>
                <li>
                    Часов: <strong>{course.hours}</strong>
                </li>
                <li>
                    Форматы: <strong>{course.formats.map((format) => FORMAT_LABELS[format]).join(", ")}</strong>
                </li>
            </ul>

            <div className={styles.reviewText}>
                <h4>Описание</h4>
                <p>{course.description}</p>
            </div>

            {course.program ? (
                <details className={styles.program}>
                    <summary>Программа курса</summary>
                    <p>{course.program}</p>
                </details>
            ) : (
                <p className={styles.muted}>Программа не указана</p>
            )}

            {!isPending && (
                <p className={styles.muted}>
                    Проверен {formatDate(course.moderatedAt || course.updatedAt)}
                    {course.rejectionReason && (
                        <>
                            {" "}· причина: <strong className={styles.reason}>{course.rejectionReason}</strong>
                        </>
                    )}
                </p>
            )}

            {isPending && !rejecting && (
                <div className={styles.moderationActions}>
                    <span className={styles.muted}>Отправлен {formatDate(course.updatedAt)}</span>
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
                            <Chip key={item} active={reason === item} onClick={() => changeReason(item)}>
                                {item}
                            </Chip>
                        ))}
                    </div>
                    <Textarea
                        label="Причина отклонения"
                        hint="Преподаватель увидит её в личном кабинете"
                        rows={2}
                        maxLength={500}
                        value={reason}
                        onChange={(event) => changeReason(event.target.value)}
                        error={reasonError}
                    />
                    <div className={styles.moderationActions}>
                        <Button variant="ghost" disabled={busy} onClick={() => setRejecting(false)}>
                            Отмена
                        </Button>
                        <Button disabled={busy} loading={busy && clicked === "reject"} onClick={reject}>
                            Отклонить курс
                        </Button>
                    </div>
                </div>
            )}
        </article>
    )
}

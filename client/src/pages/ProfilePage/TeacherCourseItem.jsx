import { useState } from "react"
import { Link } from "react-router-dom"
import { COURSE_STATUS_LABELS, COURSE_STATUS_TONE, courseEditRoute, courseRoute } from "@/shared/consts"
import { formatRating, plural } from "@/shared/utils"
import { Alert } from "@/ui/Alert"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"
import styles from "./ProfilePage.module.css"

const EDIT_LABEL = {
    draft: "Продолжить",
    pending: "Изменить",
    rejected: "Исправить"
}

export function TeacherCourseItem({ course, canEdit, onShowReviews, onDelete }) {
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const isPublished = course.status === "published"

    const handleDelete = async () => {
        setDeleting(true)
        const done = await onDelete(course)
        if (!done) setDeleting(false)
    }

    return (
        <li className={styles.reviewItem}>
            <div className={styles.reviewItemTop}>
                <div className={styles.reviewItemTitle}>
                    {isPublished ? (
                        <Link to={courseRoute(course.id)} className={styles.courseLink}>
                            {course.title}
                        </Link>
                    ) : (
                        <span className={styles.courseLink}>{course.title}</span>
                    )}
                    <span className={styles.muted}>
                        {course.faculty?.shortName || course.faculty?.name} · {course.semester?.name} · {course.hours} ч.
                    </span>
                </div>
                <div className={styles.reviewItemBadges}>
                    <Badge tone={COURSE_STATUS_TONE[course.status]}>{COURSE_STATUS_LABELS[course.status]}</Badge>
                    {course.reviewsCount > 0 && (
                        <span className={styles.ratingBadge}>
                            <span className="visually-hidden">Рейтинг </span>
                            {formatRating(course.avgRating)}
                        </span>
                    )}
                </div>
            </div>

            {course.status === "rejected" && course.rejectionReason && (
                <Alert tone="warning">Причина отклонения: {course.rejectionReason}</Alert>
            )}

            <div className={styles.reviewItemActions}>
                {confirming ? (
                    <>
                        <span className={styles.muted}>Удалить курс без возможности восстановить?</span>
                        <Button variant="ghost" size="sm" disabled={deleting} onClick={() => setConfirming(false)}>
                            Отмена
                        </Button>
                        <Button size="sm" loading={deleting} onClick={handleDelete}>
                            Да, удалить
                        </Button>
                    </>
                ) : isPublished ? (
                    <>
                        <span className={styles.muted}>
                            {course.reviewsCount > 0
                                ? `${course.reviewsCount} ${plural(course.reviewsCount, ["отзыв", "отзыва", "отзывов"])}`
                                : "Отзывов пока нет"}
                        </span>
                        {course.reviewsCount > 0 && (
                            <Button variant="outline" size="sm" onClick={() => onShowReviews({ course: course.id })}>
                                Смотреть отзывы
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <span className={styles.muted}>
                            {course.status === "pending" ? "Ждёт проверки администратором" : "Курс не виден в каталоге"}
                        </span>
                        {canEdit && (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                                    Удалить
                                </Button>
                                <Button variant="outline" size="sm" to={courseEditRoute(course.id)}>
                                    {EDIT_LABEL[course.status]}
                                </Button>
                            </>
                        )}
                    </>
                )}
            </div>
        </li>
    )
}

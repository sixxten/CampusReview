import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { parseApiError, teacherApi } from "@/shared/api"
import { COURSE_STATUS_LABELS, COURSE_STATUS_TONE, courseRoute } from "@/shared/consts"
import { formatRating, plural } from "@/shared/utils"
import { Alert } from "@/ui/Alert"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Spinner } from "@/ui/Spinner"
import styles from "./ProfilePage.module.css"

export function TeacherCoursesTab({ onShowReviews }) {
    const [data, setData] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        let ignore = false
        teacherApi
            .getCourses()
            .then((result) => {
                if (!ignore) setData(result)
            })
            .catch((err) => {
                if (ignore) return
                setError(parseApiError(err).message)
                setData({ courses: [], summary: null })
            })
        return () => {
            ignore = true
        }
    }, [])

    if (data === null) {
        return (
            <div className={styles.loader}>
                <Spinner />
            </div>
        )
    }

    const { courses, summary } = data

    return (
        <div className={styles.tabContent}>
            {error && <Alert tone="danger">{error}</Alert>}

            {summary && (
                <dl className={styles.stats}>
                    <div className={styles.stat}>
                        <dt>Курсов</dt>
                        <dd>{summary.courses}</dd>
                    </div>
                    <div className={styles.stat}>
                        <dt>Отзывов</dt>
                        <dd>{summary.reviews}</dd>
                    </div>
                    <div className={styles.stat}>
                        <dt>Средняя оценка</dt>
                        <dd>{summary.reviews ? formatRating(summary.rating) : "—"}</dd>
                    </div>
                    <div className={`${styles.stat} ${summary.unanswered ? styles.statAccent : ""}`}>
                        <dt>Без ответа</dt>
                        <dd>{summary.unanswered}</dd>
                    </div>
                </dl>
            )}

            {courses.length === 0 ? (
                <Card className={styles.empty}>
                    <h2>У вас пока нет курсов</h2>
                    <p className={styles.muted}>Когда за вами закрепят курс, он появится здесь вместе с отзывами студентов.</p>
                </Card>
            ) : (
                <ul className={styles.reviewList}>
                    {courses.map((course) => (
                        <li key={course.id} className={styles.reviewItem}>
                            <div className={styles.reviewItemTop}>
                                <div className={styles.reviewItemTitle}>
                                    {course.status === "published" ? (
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

                            {course.rejectionReason && course.status === "rejected" && (
                                <Alert tone="warning">Причина отклонения: {course.rejectionReason}</Alert>
                            )}

                            <div className={styles.reviewItemActions}>
                                <span className={styles.muted}>
                                    {course.reviewsCount} {plural(course.reviewsCount, ["отзыв", "отзыва", "отзывов"])}
                                    {course.unansweredCount > 0 && `, без ответа: ${course.unansweredCount}`}
                                </span>
                                {course.unansweredCount > 0 && (
                                    <Button size="sm" onClick={() => onShowReviews({ course: course.id, replied: "no" })}>
                                        Ответить
                                    </Button>
                                )}
                                {course.reviewsCount > 0 && (
                                    <Button variant="outline" size="sm" onClick={() => onShowReviews({ course: course.id })}>
                                        Все отзывы
                                    </Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { parseApiError, teacherApi } from "@/shared/api"
import { ROUTES } from "@/shared/consts"
import { formatRating } from "@/shared/utils"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Spinner } from "@/ui/Spinner"
import { TeacherCourseItem } from "./TeacherCourseItem"
import styles from "./ProfilePage.module.css"

export function TeacherCoursesTab({ canEdit, onShowReviews }) {
    const location = useLocation()
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

    const handleDelete = async (course) => {
        setError("")
        try {
            await teacherApi.removeCourse(course.id)
            setData((prev) => ({
                courses: prev.courses.filter((item) => item.id !== course.id),
                summary: prev.summary && { ...prev.summary, courses: prev.summary.courses - 1 }
            }))
            return true
        } catch (err) {
            setError(parseApiError(err).message)
            return false
        }
    }

    if (data === null) {
        return (
            <div className={styles.loader}>
                <Spinner />
            </div>
        )
    }

    const { courses, summary } = data
    const notice = location.state?.notice

    return (
        <div className={styles.tabContent}>
            {notice && <Alert tone="success">{notice}</Alert>}
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
                    <div className={styles.stat}>
                        <dt>В каталоге</dt>
                        <dd>{summary.published}</dd>
                    </div>
                </dl>
            )}

            <div className={styles.tabToolbar}>
                <h2 className={styles.sectionTitle}>Мои курсы</h2>
                {canEdit ? (
                    <Button size="sm" to={ROUTES.COURSE_NEW}>
                        Добавить курс
                    </Button>
                ) : (
                    <span className={styles.muted}>Добавлять курсы можно после подтверждения аккаунта</span>
                )}
            </div>

            {courses.length === 0 ? (
                <Card className={styles.empty}>
                    <h2>У вас пока нет курсов</h2>
                    <p className={styles.muted}>Добавьте курс — после проверки администратором он появится в каталоге.</p>
                </Card>
            ) : (
                <ul className={styles.reviewList}>
                    {courses.map((course) => (
                        <TeacherCourseItem
                            key={course.id}
                            course={course}
                            canEdit={canEdit}
                            onShowReviews={onShowReviews}
                            onDelete={handleDelete}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}

import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { courseApi, parseApiError } from "@/shared/api"
import { FORMAT_LABELS, ROUTES } from "@/shared/consts"
import { getDifficultyLabel } from "@/shared/utils"
import { Alert } from "@/ui/Alert"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Spinner } from "@/ui/Spinner"
import { CourseRating } from "./CourseRating"
import { CourseReviews } from "./CourseReviews"
import styles from "./CoursePage.module.css"

const parseProgram = (program) =>
    (program || "")
        .split("\n")
        .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
        .filter(Boolean)

export function CoursePage() {
    const { id } = useParams()
    const notice = useLocation().state?.notice
    const [result, setResult] = useState({ id: null, course: null, error: "", notFound: false })
    const loading = result.id !== id

    useEffect(() => {
        let ignore = false

        courseApi
            .getCourse(id)
            .then((course) => {
                if (!ignore) setResult({ id, course, error: "", notFound: false })
            })
            .catch((err) => {
                if (ignore) return
                const notFound = err.response?.status === 404 || err.response?.status === 400
                setResult({ id, course: null, error: parseApiError(err).message, notFound })
            })

        return () => {
            ignore = true
        }
    }, [id])

    if (loading) {
        return (
            <div className={styles.loader}>
                <Spinner />
            </div>
        )
    }

    if (result.notFound) {
        return (
            <div className={`container ${styles.page}`}>
                <Card className={styles.notFound}>
                    <h1>Курс не найден</h1>
                    <p className={styles.muted}>Возможно, его сняли с публикации или ссылка устарела.</p>
                    <Button to={ROUTES.HOME}>Вернуться в каталог</Button>
                </Card>
            </div>
        )
    }

    if (result.error) {
        return (
            <div className={`container ${styles.page}`}>
                <Alert tone="danger">{result.error}</Alert>
            </div>
        )
    }

    const { course } = result
    const { teacher, faculty, semester } = course
    const program = parseProgram(course.program)
    const hasReviews = course.reviewsCount > 0

    return (
        <div className={`container ${styles.page}`}>
            <nav className={styles.breadcrumbs} aria-label="Навигационная цепочка">
                <Link to={ROUTES.HOME}>Каталог курсов</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{course.title}</span>
            </nav>

            {notice && <Alert tone="success">{notice}</Alert>}

            <Card as="header" className={styles.header}>
                <h1>{course.title}</h1>
                <p className={styles.meta}>
                    {teacher.firstName} {teacher.lastName} · {faculty.name} · {semester.name}
                </p>
                <div className={styles.badges}>
                    {course.formats.map((format) => (
                        <Badge key={format}>{FORMAT_LABELS[format]}</Badge>
                    ))}
                    {hasReviews && (
                        <Badge tone="neutral">Сложность: {getDifficultyLabel(course.avgDifficulty).toLowerCase()}</Badge>
                    )}
                </div>
            </Card>

            <div className={styles.layout}>
                <div className={styles.main}>
                    <Card as="section" className={styles.section} aria-labelledby="about-title">
                        <h2 id="about-title">О курсе</h2>
                        <p className={styles.description}>{course.description}</p>
                    </Card>

                    {program.length > 0 && (
                        <Card as="section" className={styles.section} aria-labelledby="program-title">
                            <h2 id="program-title">Программа</h2>
                            <ol className={styles.program}>
                                {program.map((topic) => (
                                    <li key={topic}>{topic}</li>
                                ))}
                            </ol>
                        </Card>
                    )}

                    <CourseReviews courseId={id} />
                </div>

                <aside className={styles.aside}>
                    <CourseRating courseId={id} />

                    <Card className={styles.section}>
                        <h2>Информация</h2>
                        <dl className={styles.facts}>
                            <div>
                                <dt>Преподаватель</dt>
                                <dd>
                                    {teacher.firstName} {teacher.lastName}
                                </dd>
                            </div>
                            <div>
                                <dt>Факультет</dt>
                                <dd>{faculty.name}</dd>
                            </div>
                            <div>
                                <dt>Семестр</dt>
                                <dd>{semester.name}</dd>
                            </div>
                            <div>
                                <dt>Количество часов</dt>
                                <dd>{course.hours} ч</dd>
                            </div>
                            <div>
                                <dt>Формат</dt>
                                <dd>{course.formats.map((format) => FORMAT_LABELS[format]).join(", ")}</dd>
                            </div>
                        </dl>
                    </Card>
                </aside>
            </div>
        </div>
    )
}

import { Link } from "react-router-dom"
import { Badge } from "@/ui/Badge"
import { Card } from "@/ui/Card"
import { courseRoute, FORMAT_LABELS } from "@/shared/consts"
import { formatRating, getDifficultyLabel, plural } from "@/shared/utils"
import styles from "./CourseCard.module.css"

export function CourseCard({ course }) {
    const { teacher, faculty, semester } = course
    const hasReviews = course.reviewsCount > 0

    return (
        <Card as="article" className={styles.card}>
            <div className={styles.body}>
                <h2 className={styles.title}>
                    <Link to={courseRoute(course.id)} className={styles.link}>
                        {course.title}
                    </Link>
                </h2>
                <p className={styles.meta}>
                    {teacher.firstName} {teacher.lastName} · {faculty.shortName} · {course.hours} ч · {semester.name}
                </p>
                <p className={styles.description}>{course.description}</p>
                <div className={styles.badges}>
                    {course.formats.map((format) => (
                        <Badge key={format}>{FORMAT_LABELS[format]}</Badge>
                    ))}
                    {hasReviews && (
                        <Badge tone="neutral">Сложность: {getDifficultyLabel(course.avgDifficulty).toLowerCase()}</Badge>
                    )}
                </div>
            </div>

            <div className={styles.rating}>
                {hasReviews ? (
                    <>
                        <span className={styles.ratingValue}>{formatRating(course.avgRating)}</span>
                        <span className={styles.ratingCount}>
                            {course.reviewsCount} {plural(course.reviewsCount, ["отзыв", "отзыва", "отзывов"])}
                        </span>
                    </>
                ) : (
                    <span className={styles.noReviews}>Пока нет отзывов</span>
                )}
            </div>
        </Card>
    )
}

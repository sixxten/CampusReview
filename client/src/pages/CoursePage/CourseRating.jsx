import { useEffect, useState } from "react"
import { reviewApi } from "@/shared/api"
import { REVIEW_CRITERIA } from "@/shared/consts"
import { formatRating, plural } from "@/shared/utils"
import { Card } from "@/ui/Card"
import { Spinner } from "@/ui/Spinner"
import styles from "./CoursePage.module.css"

function Bar({ label, percent, value }) {
    return (
        <div className={styles.bar}>
            <span className={styles.barLabel}>{label}</span>
            <span className={styles.barTrack} aria-hidden="true">
                <span className={styles.barFill} style={{ width: `${percent}%` }} />
            </span>
            <span className={styles.barValue}>{value}</span>
        </div>
    )
}

export function CourseRating({ courseId }) {
    const [result, setResult] = useState({ id: null, stats: null })
    const loading = result.id !== courseId

    useEffect(() => {
        let ignore = false
        reviewApi
            .getCourseStats(courseId)
            .then((stats) => {
                if (!ignore) setResult({ id: courseId, stats })
            })
            .catch(() => {
                if (!ignore) setResult({ id: courseId, stats: null })
            })
        return () => {
            ignore = true
        }
    }, [courseId])

    const { stats } = result

    return (
        <Card as="section" className={styles.section} aria-labelledby="rating-title">
            <h2 id="rating-title">Рейтинг</h2>

            {loading ? (
                <Spinner />
            ) : !stats || stats.count === 0 ? (
                <p className={styles.muted}>Оценок пока нет</p>
            ) : (
                <>
                    <div className={styles.rating}>
                        <span className={styles.ratingValue}>{formatRating(stats.rating)}</span>
                        <span className={styles.muted}>
                            из 5 · {stats.count} {plural(stats.count, ["отзыв", "отзыва", "отзывов"])}
                        </span>
                    </div>

                    <div className={styles.bars}>
                        <h3 className={styles.subheading}>Распределение оценок</h3>
                        {[5, 4, 3, 2, 1].map((score) => (
                            <Bar
                                key={score}
                                label={`${score} ★`}
                                percent={(stats.distribution[score] / stats.count) * 100}
                                value={stats.distribution[score]}
                            />
                        ))}
                    </div>

                    <div className={styles.bars}>
                        <h3 className={styles.subheading}>По критериям</h3>
                        {REVIEW_CRITERIA.map((criterion) => (
                            <Bar
                                key={criterion.key}
                                label={criterion.label}
                                percent={(stats.averages[criterion.key] / 5) * 100}
                                value={formatRating(stats.averages[criterion.key])}
                            />
                        ))}
                    </div>
                </>
            )}
        </Card>
    )
}

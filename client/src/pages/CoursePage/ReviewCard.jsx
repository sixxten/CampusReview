import { REVIEW_CRITERIA } from "@/shared/consts"
import { formatRating } from "@/shared/utils"
import { ReviewReply } from "@/widgets/ReviewReply"
import { ReviewComplaint } from "./ReviewComplaint"
import styles from "./CoursePage.module.css"

const formatDate = (value) => new Date(value).toLocaleDateString("ru-RU")

const TEXT_BLOCKS = [
    { key: "pros", title: "Понравилось" },
    { key: "cons", title: "Не понравилось" },
    { key: "advice", title: "Совет будущим студентам" }
]

export function ReviewCard({ review }) {
    const author = review.author ? `${review.author.firstName} ${review.author.lastName}` : "Анонимный студент"

    return (
        <article className={styles.review}>
            <header className={styles.reviewHeader}>
                <div>
                    <p className={styles.reviewAuthor}>{author}</p>
                    <p className={styles.reviewMeta}>
                        Проходил(а) курс: {review.semester?.name || "семестр не указан"} · {formatDate(review.createdAt)}
                    </p>
                </div>
                <span className={styles.reviewRating}>
                    <span className="visually-hidden">Оценка </span>
                    {formatRating(review.rating)}
                    <span className="visually-hidden"> из 5</span>
                </span>
            </header>

            <ul className={styles.reviewScores} aria-label="Оценки по критериям">
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

            <ReviewReply reply={review.reply} />

            <ReviewComplaint review={review} />
        </article>
    )
}

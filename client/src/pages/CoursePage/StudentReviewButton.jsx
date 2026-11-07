import { useEffect, useState } from "react"
import { reviewApi } from "@/shared/api"
import { reviewFormRoute, REVIEW_STATUS } from "@/shared/consts"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"

const BY_STATUS = {
    [REVIEW_STATUS.DRAFT]: { label: "Продолжить черновик", variant: "primary" },
    [REVIEW_STATUS.PENDING]: { label: "Отзыв на модерации", variant: "outline" },
    [REVIEW_STATUS.REJECTED]: { label: "Исправить отзыв", variant: "primary" }
}

export function StudentReviewButton({ courseId }) {
    const [result, setResult] = useState({ id: null, review: null })
    const loading = result.id !== courseId

    useEffect(() => {
        let ignore = false
        reviewApi
            .getMy({ courseId })
            .then((reviews) => {
                if (!ignore) setResult({ id: courseId, review: reviews[0] || null })
            })
            .catch(() => {
                if (!ignore) setResult({ id: courseId, review: null })
            })
        return () => {
            ignore = true
        }
    }, [courseId])

    if (loading) return null

    const { review } = result
    if (review?.status === REVIEW_STATUS.PUBLISHED) {
        return <Badge tone="success">Ваш отзыв опубликован</Badge>
    }

    const config = review ? BY_STATUS[review.status] : { label: "Написать отзыв", variant: "primary" }
    return (
        <Button variant={config.variant} to={reviewFormRoute(courseId)}>
            {config.label}
        </Button>
    )
}

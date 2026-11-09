import { observer } from "mobx-react-lite"
import { useStores } from "@/store"
import { ROLES } from "@/shared/consts"
import { ComplaintForm } from "./ComplaintForm"

export const ReviewComplaint = observer(({ review }) => {
    const { userStore } = useStores()
    const { role, user } = userStore

    if (!userStore.isAuth || ![ROLES.STUDENT, ROLES.TEACHER].includes(role)) return null
    if (review.author && review.author.id === user.id) return null

    return <ComplaintForm reviewId={review.id} />
})

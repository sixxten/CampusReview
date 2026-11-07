import { observer } from "mobx-react-lite"
import { useStores } from "@/store"
import { ROLES, ROUTES } from "@/shared/consts"
import { Button } from "@/ui/Button"
import { StudentReviewButton } from "./StudentReviewButton"

export const MyReviewButton = observer(({ courseId }) => {
    const { userStore } = useStores()

    if (userStore.isChecking) return null

    if (!userStore.isAuth) {
        return (
            <Button variant="outline" to={ROUTES.LOGIN}>
                Войти, чтобы написать отзыв
            </Button>
        )
    }

    if (userStore.role !== ROLES.STUDENT) return null

    return <StudentReviewButton courseId={courseId} />
})
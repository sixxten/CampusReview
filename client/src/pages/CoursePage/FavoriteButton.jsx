import { observer } from "mobx-react-lite"
import { useStores } from "@/store"
import { ROLES } from "@/shared/consts"
import { FavoriteToggle } from "./FavoriteToggle"

export const FavoriteButton = observer(({ courseId }) => {
    const { userStore } = useStores()
    if (userStore.isChecking || userStore.role !== ROLES.STUDENT) return null
    return <FavoriteToggle courseId={courseId} />
})

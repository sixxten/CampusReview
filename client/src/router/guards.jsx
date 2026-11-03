import { observer } from "mobx-react-lite"
import { Navigate, Outlet } from "react-router-dom"
import { useStores } from "@/store"
import { ROUTES } from "@/shared/consts"
import { PageLoader } from "./PageLoader"


export const RequireAuth = observer(({ roles }) => {
    const { userStore } = useStores()

    if (userStore.isChecking) return <PageLoader />
    if (!userStore.isAuth) return <Navigate to={ROUTES.HOME} replace />
    if (roles && !roles.includes(userStore.role)) return <Navigate to={ROUTES.HOME} replace />

    return <Outlet />
})

export const GuestOnly = observer(() => {
    const { userStore } = useStores()

    if (userStore.isChecking) return <PageLoader />
    if (userStore.isAuth) return <Navigate to={ROUTES.HOME} replace />

    return <Outlet />
})

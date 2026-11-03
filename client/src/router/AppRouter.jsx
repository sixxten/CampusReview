import { Route, Routes } from "react-router-dom"
import { MainLayout } from "@/layout/MainLayout"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ROUTES } from "@/shared/consts"
import { GuestOnly, RequireAuth } from "./guards"

export function AppRouter() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* доступно всем */}
                <Route path={ROUTES.HOME} element={<HomePage />} />

                {/* только гостям */}
                <Route element={<GuestOnly />}>
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTRATION} element={<RegisterPage />} />
                </Route>

                {/* только залогиненным (любая роль) */}
                <Route element={<RequireAuth />}>
                    <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}

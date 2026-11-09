import { Route, Routes } from "react-router-dom"
import { MainLayout } from "@/layout/MainLayout"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { AdminPage } from "@/pages/AdminPage"
import { CoursePage } from "@/pages/CoursePage"
import { ReviewFormPage } from "@/pages/ReviewFormPage"
import { CourseFormPage } from "@/pages/CourseFormPage"
import { ROLES, ROUTES } from "@/shared/consts"
import { GuestOnly, RequireAuth } from "./guards"

export function AppRouter() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.COURSE} element={<CoursePage />} />

                <Route element={<GuestOnly />}>
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTRATION} element={<RegisterPage />} />
                </Route>

                <Route element={<RequireAuth />}>
                    <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                </Route>

                <Route element={<RequireAuth roles={[ROLES.STUDENT]} />}>
                    <Route path={ROUTES.REVIEW_FORM} element={<ReviewFormPage />} />
                </Route>

                <Route element={<RequireAuth roles={[ROLES.TEACHER]} />}>
                    <Route path={ROUTES.COURSE_NEW} element={<CourseFormPage />} />
                    <Route path={ROUTES.COURSE_EDIT} element={<CourseFormPage />} />
                </Route>

                <Route element={<RequireAuth roles={[ROLES.ADMIN]} />}>
                    <Route path={ROUTES.ADMIN} element={<AdminPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}

import { AuthLayout } from "@/layout/AuthLayout"
import { Button } from "@/ui/Button"
import { ROUTES } from "@/shared/consts"

export function NotFoundPage() {
    return (
        <AuthLayout title="Страница не найдена" subtitle="">
            <Button to={ROUTES.HOME} fullWidth>
                Вернуться на главную
            </Button>
        </AuthLayout>
    )
}

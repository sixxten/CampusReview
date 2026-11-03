import { observer } from "mobx-react-lite"
import { useStores } from "@/store"
import { ROUTES } from "@/shared/consts"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import styles from "./HomePage.module.css"

export const HomePage = observer(() => {
    const { userStore } = useStores()

    return (
        <div className={`container ${styles.page}`}>
            <h1>Каталог курсов</h1>

            {userStore.isAuth ? (
                <Card>Привет, {userStore.user.firstName}! Каталог курсов.</Card>
            ) : (
                <Card className={styles.banner}>
                    <span className={styles.bannerText}>
                        Войдите, чтобы писать отзывы и сохранять курсы в избранное.
                    </span>
                    <Button to={ROUTES.LOGIN}>Войти</Button>
                    <Button variant="outline" to={ROUTES.REGISTRATION}>
                        Регистрация
                    </Button>
                </Card>
            )}
        </div>
    )
})

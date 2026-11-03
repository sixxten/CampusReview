import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigate } from "react-router-dom"
import { useStores } from "@/store"
import { userApi } from "@/shared/api"
import { ROLE_LABELS, ROUTES, USER_STATUS, USER_STATUS_LABELS } from "@/shared/consts"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import styles from "./ProfilePage.module.css"

export const ProfilePage = observer(() => {
    const { userStore } = useStores()
    const navigate = useNavigate()
    const [loggingOut, setLoggingOut] = useState(false)

    useEffect(() => {
        userApi
            .fetchMe()
            .then(userStore.setUser)
            .catch(() => {})
    }, [userStore])

    const handleLogout = async () => {
        setLoggingOut(true)
        await userStore.logout()
        navigate(ROUTES.HOME, { replace: true })
    }

    const { user } = userStore
    if (!user) return null

    return (
        <div className={`container ${styles.page}`}>
            <h1>Личный кабинет</h1>

            {user.status === USER_STATUS.PENDING && (
                <Alert tone="warning">
                    Аккаунт преподавателя ожидает подтверждения администратором. После проверки откроются ответы на отзывы.
                </Alert>
            )}

            <Card className={styles.card}>
                <div className={styles.avatar} aria-hidden="true">
                    {user.firstName[0]}
                    {user.lastName[0]}
                </div>
                <div className={styles.info}>
                    <h2>{userStore.fullName}</h2>
                    <span className={styles.email}>{user.email}</span>
                    <div className={styles.tags}>
                        <span className={styles.tag}>{ROLE_LABELS[user.role]}</span>
                        <span className={`${styles.tag} ${styles[user.status]}`}>{USER_STATUS_LABELS[user.status]}</span>
                    </div>
                </div>
                <Button variant="outline" onClick={handleLogout} loading={loggingOut}>
                    Выйти
                </Button>
            </Card>
        </div>
    )
})

import { useEffect, useState } from "react"
import { favoriteApi, parseApiError } from "@/shared/api"
import { ROUTES } from "@/shared/consts"
import { CourseCard } from "@/widgets/CourseCard"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Spinner } from "@/ui/Spinner"
import styles from "./ProfilePage.module.css"

export function FavoritesTab() {
    const [courses, setCourses] = useState(null)
    const [removingId, setRemovingId] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        let ignore = false
        favoriteApi
            .getMy()
            .then((result) => {
                if (!ignore) setCourses(result)
            })
            .catch((err) => {
                if (!ignore) {
                    setError(parseApiError(err).message)
                    setCourses([])
                }
            })
        return () => {
            ignore = true
        }
    }, [])

    const remove = async (course) => {
        setRemovingId(course.id)
        setError("")
        try {
            await favoriteApi.remove(course.id)
            setCourses((prev) => prev.filter((item) => item.id !== course.id))
        } catch (err) {
            setError(parseApiError(err).message)
        } finally {
            setRemovingId(null)
        }
    }

    if (courses === null) {
        return (
            <div className={styles.loader}>
                <Spinner />
            </div>
        )
    }

    return (
        <div className={styles.tabContent}>
            {error && <Alert tone="danger">{error}</Alert>}

            {courses.length === 0 ? (
                <Card className={styles.empty}>
                    <h2>В избранном пока пусто</h2>
                    <p className={styles.muted}>Нажмите «В избранное» на странице курса, чтобы сохранить его здесь.</p>
                    <Button to={ROUTES.HOME}>Перейти в каталог</Button>
                </Card>
            ) : (
                <div className={styles.favoriteList}>
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            actions={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    loading={removingId === course.id}
                                    disabled={removingId !== null}
                                    onClick={() => remove(course)}
                                >
                                    Убрать из избранного
                                </Button>
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

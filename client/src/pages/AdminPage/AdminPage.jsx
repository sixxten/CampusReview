import { useEffect, useState } from "react"
import { adminApi, parseApiError } from "@/shared/api"
import { useDebouncedValue } from "@/shared/hooks"
import { ROLE_LABELS, USER_STATUS_LABELS } from "@/shared/consts"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Input } from "@/ui/Input"
import { Select } from "@/ui/Select"
import { Spinner } from "@/ui/Spinner"
import { UserRow } from "./UserRow"
import styles from "./AdminPage.module.css"

const PAGE_SIZE = 10

const ROLE_OPTIONS = [
    { value: "", label: "Все роли" },
    ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))
]

const STATUS_OPTIONS = [
    { value: "", label: "Все статусы" },
    ...Object.entries(USER_STATUS_LABELS).map(([value, label]) => ({ value, label }))
]

export function AdminPage() {
    const [filters, setFilters] = useState({ search: "", role: "", status: "pending" })
    const [page, setPage] = useState(1)
    const [data, setData] = useState({ users: [], total: 0, pages: 1, pendingCount: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [busyId, setBusyId] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)

    const search = useDebouncedValue(filters.search.trim())

    useEffect(() => {
        let ignore = false

        adminApi
            .getUsers({
                search: search || undefined,
                role: filters.role || undefined,
                status: filters.status || undefined,
                page,
                limit: PAGE_SIZE
            })
            .then((result) => {
                if (ignore) return
                setData(result)
                setError("")
            })
            .catch((err) => {
                if (ignore) return
                const { message, fieldErrors } = parseApiError(err)
                setError(Object.values(fieldErrors)[0] || message)
                setData((prev) => ({ ...prev, users: [], total: 0, pages: 1 }))
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })

        return () => {
            ignore = true
        }
    }, [search, filters.role, filters.status, page, reloadKey])

    const updateFilter = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }))
        setPage(1)
        setLoading(true)
    }

    const goToPage = (number) => {
        setPage(number)
        setLoading(true)
    }

    const handleAction = async (user, action) => {
        const status = action === "approve" || action === "unblock" ? "active" : "blocked"
        setBusyId(user.id)
        setError("")
        try {
            await adminApi.updateUserStatus(user.id, status)
            setReloadKey((key) => key + 1)
        } catch (err) {
            setError(parseApiError(err).message)
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className={`container ${styles.page}`}>
            <div className={styles.heading}>
                <h1>Админ-панель</h1>
                {data.pendingCount > 0 && (
                    <Button variant="outline" size="sm" onClick={() => updateFilter("status", "pending")}>
                        Ожидают подтверждения: {data.pendingCount}
                    </Button>
                )}
            </div>

            <Card className={styles.filters}>
                <Input
                    className={styles.search}
                    type="search"
                    label="Поиск"
                    placeholder="Имя, фамилия или email"
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                />
                <Select
                    label="Роль"
                    value={filters.role}
                    onChange={(event) => updateFilter("role", event.target.value)}
                    options={ROLE_OPTIONS}
                />
                <Select
                    label="Статус"
                    value={filters.status}
                    onChange={(event) => updateFilter("status", event.target.value)}
                    options={STATUS_OPTIONS}
                />
            </Card>

            {error && <Alert tone="danger">{error}</Alert>}

            <section className={styles.results} aria-label="Пользователи" aria-busy={loading}>
                <p className={styles.count}>Найдено: {data.total}</p>

                {loading && data.users.length === 0 ? (
                    <div className={styles.loader}>
                        <Spinner />
                    </div>
                ) : data.users.length > 0 ? (
                    <ul className={styles.list}>
                        {data.users.map((user) => (
                            <UserRow key={user.id} user={user} busy={busyId === user.id} onAction={handleAction} />
                        ))}
                    </ul>
                ) : (
                    <Card className={styles.empty}>
                        {filters.status === "pending" && !search && !filters.role
                            ? "Новых заявок от преподавателей нет"
                            : "Никого не нашлось. Попробуйте изменить фильтры."}
                    </Card>
                )}

                {data.pages > 1 && (
                    <nav className={styles.pagination} aria-label="Страницы">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                            Назад
                        </Button>
                        <span className={styles.pageInfo}>
                            Страница {page} из {data.pages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= data.pages}
                            onClick={() => goToPage(page + 1)}
                        >
                            Вперёд
                        </Button>
                    </nav>
                )}
            </section>
        </div>
    )
}

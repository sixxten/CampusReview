import { useEffect, useState } from "react"
import { adminApi, parseApiError } from "@/shared/api"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Select } from "@/ui/Select"
import { Spinner } from "@/ui/Spinner"
import { ComplaintCard } from "./ComplaintCard"
import styles from "./AdminPage.module.css"

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
    { value: "new", label: "Новые" },
    { value: "accepted", label: "Принятые (отзыв скрыт)" },
    { value: "rejected", label: "Отклонённые (отзыв оставлен)" }
]

export function ComplaintsTab({ onChanged }) {
    const [status, setStatus] = useState("new")
    const [page, setPage] = useState(1)
    const [data, setData] = useState({ complaints: [], total: 0, pages: 1 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [busyId, setBusyId] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let ignore = false
        adminApi
            .getComplaints({ status, page, limit: PAGE_SIZE })
            .then((result) => {
                if (ignore) return
                setData(result)
                setError("")
            })
            .catch((err) => {
                if (ignore) return
                setError(parseApiError(err).message)
                setData({ complaints: [], total: 0, pages: 1 })
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [status, page, reloadKey])

    const changeStatus = (value) => {
        setStatus(value)
        setPage(1)
        setLoading(true)
    }

    const goToPage = (number) => {
        setPage(number)
        setLoading(true)
    }

    const resolve = async (complaint, decision) => {
        setBusyId(complaint.id)
        setError("")
        try {
            await adminApi.resolveComplaint(complaint.id, decision)
            setReloadKey((key) => key + 1)
            onChanged()
        } catch (err) {
            setError(parseApiError(err).message)
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className={styles.tabContent}>
            <Card className={styles.complaintFilters}>
                <Select label="Статус" value={status} onChange={(event) => changeStatus(event.target.value)} options={STATUS_OPTIONS} />
            </Card>

            {error && <Alert tone="danger">{error}</Alert>}

            <section className={styles.results} aria-label="Жалобы" aria-busy={loading}>
                <p className={styles.count}>Найдено: {data.total}</p>

                {loading && data.complaints.length === 0 ? (
                    <div className={styles.loader}>
                        <Spinner />
                    </div>
                ) : data.complaints.length > 0 ? (
                    <div className={styles.moderationList}>
                        {data.complaints.map((complaint) => (
                            <ComplaintCard key={complaint.id} complaint={complaint} busy={busyId === complaint.id} onResolve={resolve} />
                        ))}
                    </div>
                ) : (
                    <Card className={styles.empty}>{status === "new" ? "Новых жалоб нет" : "Здесь пока пусто"}</Card>
                )}

                {data.pages > 1 && (
                    <nav className={styles.pagination} aria-label="Страницы">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                            Назад
                        </Button>
                        <span className={styles.pageInfo}>
                            Страница {page} из {data.pages}
                        </span>
                        <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => goToPage(page + 1)}>
                            Вперёд
                        </Button>
                    </nav>
                )}
            </section>
        </div>
    )
}

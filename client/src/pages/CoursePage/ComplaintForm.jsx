import { useState } from "react"
import { complaintApi, parseApiError } from "@/shared/api"
import { COMPLAINT_REASONS } from "@/shared/consts"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Chip } from "@/ui/Chip"
import { Textarea } from "@/ui/Textarea"
import styles from "./CoursePage.module.css"

export function ComplaintForm({ reviewId }) {
    const [step, setStep] = useState("closed")
    const [reason, setReason] = useState("")
    const [comment, setComment] = useState("")
    const [error, setError] = useState("")
    const [sending, setSending] = useState(false)

    const send = async () => {
        if (!reason) {
            setError("Выберите причину")
            return
        }
        if (reason === "other" && !comment.trim()) {
            setError("Опишите, что не так с отзывом")
            return
        }
        setSending(true)
        setError("")
        try {
            await complaintApi.create({ reviewId, reason, comment: comment.trim() || null })
            setStep("sent")
        } catch (err) {
            const { message, fieldErrors } = parseApiError(err)
            setError(Object.values(fieldErrors)[0] || message)
        } finally {
            setSending(false)
        }
    }

    if (step === "sent") {
        return <p className={styles.complaintSent}>Спасибо! Жалоба отправлена администратору.</p>
    }

    if (step === "closed") {
        return (
            <div className={styles.complaintToggle}>
                <Button variant="ghost" size="sm" onClick={() => setStep("open")}>
                    Пожаловаться
                </Button>
            </div>
        )
    }

    return (
        <div className={styles.complaintForm}>
            <p className={styles.complaintTitle}>Что не так с этим отзывом?</p>
            <div className={styles.complaintReasons} role="group" aria-label="Причина жалобы">
                {COMPLAINT_REASONS.map((item) => (
                    <Chip
                        key={item.value}
                        active={reason === item.value}
                        onClick={() => {
                            setReason(item.value)
                            setError("")
                        }}
                    >
                        {item.label}
                    </Chip>
                ))}
            </div>
            <Textarea
                label={reason === "other" ? "Комментарий" : "Комментарий (необязательно)"}
                rows={2}
                maxLength={500}
                value={comment}
                onChange={(event) => {
                    setComment(event.target.value)
                    setError("")
                }}
            />
            {error && <Alert tone="danger">{error}</Alert>}
            <div className={styles.complaintActions}>
                <Button variant="ghost" size="sm" disabled={sending} onClick={() => setStep("closed")}>
                    Отмена
                </Button>
                <Button size="sm" loading={sending} onClick={send}>
                    Отправить жалобу
                </Button>
            </div>
        </div>
    )
}

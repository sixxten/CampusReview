import { useState } from "react"
import { userApi, parseApiError } from "@/shared/api"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Input } from "@/ui/Input"
import styles from "./ProfilePage.module.css"

const EMPTY_FORM = { currentPassword: "", newPassword: "", newPasswordRepeat: "" }

// Форма «Смена пароля»
export function PasswordForm() {
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
        setMessage(null)
    }

    const validate = () => {
        const next = {}
        if (!form.currentPassword) next.currentPassword = "Введите текущий пароль"
        if (form.newPassword.length < 8) next.newPassword = "Минимум 8 символов"
        if (form.newPassword !== form.newPasswordRepeat) next.newPasswordRepeat = "Пароли не совпадают"
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!validate()) return

        setLoading(true)
        try {
            await userApi.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            })
            setForm(EMPTY_FORM)
            setMessage({ tone: "success", text: "Пароль изменён." })
        } catch (error) {
            const { message, fieldErrors } = parseApiError(error)
            setErrors(fieldErrors)
            setMessage({ tone: "danger", text: message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card as="section" className={styles.section} aria-labelledby="password-form-title">
            <h2 id="password-form-title">Смена пароля</h2>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {message && <Alert tone={message.tone}>{message.text}</Alert>}
                <Input
                    label="Текущий пароль"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={form.currentPassword}
                    onChange={handleChange}
                    error={errors.currentPassword}
                />
                <Input
                    label="Новый пароль"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Минимум 8 символов"
                    value={form.newPassword}
                    onChange={handleChange}
                    error={errors.newPassword}
                />
                <Input
                    label="Повтор нового пароля"
                    name="newPasswordRepeat"
                    type="password"
                    autoComplete="new-password"
                    value={form.newPasswordRepeat}
                    onChange={handleChange}
                    error={errors.newPasswordRepeat}
                />
                <Button type="submit" loading={loading} className={styles.submit}>
                    Изменить пароль
                </Button>
            </form>
        </Card>
    )
}
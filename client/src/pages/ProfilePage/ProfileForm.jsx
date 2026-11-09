import { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "@/store"
import { parseApiError } from "@/shared/api"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Input } from "@/ui/Input"
import styles from "./ProfilePage.module.css"

export const ProfileForm = observer(() => {
    const { userStore } = useStores()
    const { user } = userStore

    const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName })
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState(null) // { tone: "success" | "danger", text }
    const [loading, setLoading] = useState(false)

    const changed = form.firstName.trim() !== user.firstName || form.lastName.trim() !== user.lastName

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
        setMessage(null)
    }

    const validate = () => {
        const next = {}
        if (!form.firstName.trim()) next.firstName = "Укажите имя"
        if (!form.lastName.trim()) next.lastName = "Укажите фамилию"
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!validate()) return

        setLoading(true)
        try {
            const updated = await userStore.updateProfile({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim()
            })
            setForm({ firstName: updated.firstName, lastName: updated.lastName })
            setMessage({ tone: "success", text: "Данные сохранены" })
        } catch (error) {
            const { message, fieldErrors } = parseApiError(error)
            setErrors(fieldErrors)
            setMessage({ tone: "danger", text: message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card as="section" className={styles.section} aria-labelledby="profile-form-title">
            <h2 id="profile-form-title">Личные данные</h2>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {message && <Alert tone={message.tone}>{message.text}</Alert>}
                <Input
                    label="Имя"
                    name="firstName"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                />
                <Input
                    label="Фамилия"
                    name="lastName"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                />
                <Input label="Email" value={user.email} disabled hint="Email изменить нельзя" />
                <Button type="submit" loading={loading} disabled={!changed} className={styles.submit}>
                    Сохранить
                </Button>
            </form>
        </Card>
    )
})

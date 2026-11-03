import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useStores } from "@/store"
import { AuthLayout } from "@/layout/AuthLayout"
import { parseApiError } from "@/shared/api"
import { ROUTES } from "@/shared/consts"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Input } from "@/ui/Input"
import styles from "./LoginPage.module.css"

export function LoginPage() {
    const { userStore } = useStores()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: "", password: "" })
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const validate = () => {
        const next = {}
        if (!form.email.trim()) next.email = "Введите email"
        if (!form.password) next.password = "Введите пароль"
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setFormError("")
        if (!validate()) return

        setLoading(true)
        try {
            await userStore.login(form.email.trim(), form.password)
            navigate(ROUTES.HOME, { replace: true })
        } catch (error) {
            const { message, fieldErrors } = parseApiError(error)
            setErrors(fieldErrors)
            setFormError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Вход"
            subtitle="Войдите, чтобы писать отзывы и сохранять курсы в избранное"
            footer={
                <>
                    Нет аккаунта? <Link to={ROUTES.REGISTRATION}>Зарегистрироваться</Link>
                </>
            }
        >
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ivanov@campus.ru"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                />
                <Input
                    label="Пароль"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <Button type="submit" fullWidth loading={loading}>
                    Войти
                </Button>
            </form>
        </AuthLayout>
    )
}

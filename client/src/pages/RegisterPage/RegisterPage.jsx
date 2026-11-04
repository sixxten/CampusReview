import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useStores } from "@/store"
import { AuthLayout } from "@/layout/AuthLayout"
import { parseApiError } from "@/shared/api"
import { ROLES, ROUTES } from "@/shared/consts"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Checkbox } from "@/ui/Checkbox"
import { Input } from "@/ui/Input"
import styles from "./RegisterPage.module.css"

const ROLE_OPTIONS = [
    { value: ROLES.STUDENT, label: "Студент" },
    { value: ROLES.TEACHER, label: "Преподаватель" }
]

const INITIAL_FORM = {
    role: ROLES.STUDENT,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordRepeat: "",
    agree: false
}

export function RegisterPage() {
    const { userStore } = useStores()
    const navigate = useNavigate()

    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const validate = () => {
        const next = {}
        if (!form.firstName.trim()) next.firstName = "Укажите имя"
        if (!form.lastName.trim()) next.lastName = "Укажите фамилию"
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Некорректный email"
        if (form.password.length < 8) next.password = "Минимум 8 символов"
        if (form.password !== form.passwordRepeat) next.passwordRepeat = "Пароли не совпадают"
        if (!form.agree) next.agree = "Нужно согласие с правилами"
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setFormError("")
        if (!validate()) return

        setLoading(true)
        try {
            const user = await userStore.registration({
                role: form.role,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                password: form.password
            })
            navigate(user.role === ROLES.TEACHER ? ROUTES.PROFILE : ROUTES.HOME, { replace: true })
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
            title="Регистрация"
            width={480}
            footer={
                <>
                    Уже есть аккаунт? <Link to={ROUTES.LOGIN}>Войти</Link>
                </>
            }
        >
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <fieldset className={styles.roles}>
                    <legend className="visually-hidden">Я регистрируюсь как</legend>
                    {ROLE_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className={`${styles.role} ${form.role === option.value ? styles.roleActive : ""}`}
                        >
                            <input
                                type="radio"
                                name="role"
                                value={option.value}
                                checked={form.role === option.value}
                                onChange={handleChange}
                                className="visually-hidden"
                            />
                            {option.label}
                        </label>
                    ))}
                </fieldset>
                
                <div className={styles.row}>
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
                </div>

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

                <div className={styles.row}>
                    <Input
                        label="Пароль"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Минимум 8 символов"
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                    />
                    <Input
                        label="Повтор пароля"
                        name="passwordRepeat"
                        type="password"
                        autoComplete="new-password"
                        value={form.passwordRepeat}
                        onChange={handleChange}
                        error={errors.passwordRepeat}
                    />
                </div>

                <div>
                    <Checkbox
                        name="agree"
                        label="Согласен с правилами публикации отзывов"
                        checked={form.agree}
                        onChange={handleChange}
                    />
                    {errors.agree && <p className={styles.error}>{errors.agree}</p>}
                </div>

                <Button type="submit" fullWidth loading={loading}>
                    Создать аккаунт
                </Button>
            </form>
        </AuthLayout>
    )
}

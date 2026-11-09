import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { courseApi, parseApiError, teacherApi } from "@/shared/api"
import { FORMAT_LABELS, profileTabRoute, ROUTES } from "@/shared/consts"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Checkbox } from "@/ui/Checkbox"
import { Input } from "@/ui/Input"
import { Select } from "@/ui/Select"
import { Spinner } from "@/ui/Spinner"
import { Textarea } from "@/ui/Textarea"
import styles from "./CourseFormPage.module.css"

const LIMITS = { title: 150, description: 3000, program: 5000 }

function toForm(course) {
    return {
        title: course?.title || "",
        description: course?.description || "",
        program: course?.program || "",
        hours: course?.hours ? String(course.hours) : "",
        formats: course?.formats || [],
        facultyId: course?.facultyId ? String(course.facultyId) : "",
        semesterId: course?.semesterId ? String(course.semesterId) : ""
    }
}

function toPayload(form, submit) {
    return {
        title: form.title.trim(),
        description: form.description.trim(),
        program: form.program.trim(),
        hours: Number(form.hours),
        formats: form.formats,
        facultyId: Number(form.facultyId),
        semesterId: Number(form.semesterId),
        submit
    }
}

function validate(form) {
    const errors = {}
    const title = form.title.trim()
    if (title.length < 3) errors.title = "Название — от 3 символов"
    if (form.description.trim().length < 30) errors.description = "Опишите курс подробнее — от 30 символов"
    const hours = Number(form.hours)
    if (!Number.isInteger(hours) || hours < 1 || hours > 1000) errors.hours = "Целое число от 1 до 1000"
    if (form.formats.length === 0) errors.formats = "Выберите хотя бы один формат"
    if (!form.facultyId) errors.facultyId = "Выберите факультет"
    if (!form.semesterId) errors.semesterId = "Выберите семестр"
    return errors
}

export function CourseFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const key = id || "new"

    const [loaded, setLoaded] = useState({ key: null, faculties: [], semesters: [], course: null, error: "" })
    const [form, setForm] = useState(toForm(null))
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState("")
    const [saving, setSaving] = useState(null)

    useEffect(() => {
        let ignore = false
        Promise.all([courseApi.getFilterOptions(), id ? teacherApi.getCourse(id) : Promise.resolve(null)])
            .then(([options, course]) => {
                if (ignore) return
                setLoaded({ key, faculties: options.faculties, semesters: options.semesters, course, error: "" })
                setForm(toForm(course))
            })
            .catch((err) => {
                if (!ignore) setLoaded({ key, faculties: [], semesters: [], course: null, error: parseApiError(err).message })
            })
        return () => {
            ignore = true
        }
    }, [id, key])

    const updateField = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
        setMessage("")
    }

    const toggleFormat = (format, checked) => {
        updateField("formats", checked ? [...form.formats, format] : form.formats.filter((item) => item !== format))
    }

    const save = async (submit) => {
        const found = validate(form)
        setErrors(found)
        if (Object.keys(found).length > 0) {
            setMessage("Проверьте поля формы")
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
        }

        setSaving(submit ? "submit" : "draft")
        setMessage("")
        try {
            const payload = toPayload(form, submit)
            if (id) {
                await teacherApi.updateCourse(id, payload)
            } else {
                await teacherApi.createCourse(payload)
            }
            navigate(profileTabRoute("courses"), {
                state: {
                    notice: submit
                        ? "Курс отправлен на модерацию. После проверки он появится в каталоге."
                        : "Черновик курса сохранён."
                }
            })
        } catch (err) {
            const { message: text, fieldErrors } = parseApiError(err)
            setErrors(fieldErrors)
            setMessage(text)
            setSaving(null)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        save(true)
    }

    if (loaded.key !== key) {
        return (
            <div className={styles.loader}>
                <Spinner />
            </div>
        )
    }

    const backLink = profileTabRoute("courses")

    if (loaded.error || loaded.course?.status === "published") {
        return (
            <div className={`container ${styles.page}`}>
                <Alert tone={loaded.error ? "danger" : "info"}>
                    {loaded.error || "Курс уже опубликован. Изменить его можно только через администратора."}
                </Alert>
                <Button variant="outline" to={backLink} className={styles.back}>
                    Вернуться к моим курсам
                </Button>
            </div>
        )
    }

    const { course } = loaded
    const facultyOptions = [{ value: "", label: "Выберите факультет" }, ...loaded.faculties.map((item) => ({ value: String(item.id), label: item.name }))]
    const semesterOptions = [{ value: "", label: "Выберите семестр" }, ...loaded.semesters.map((item) => ({ value: String(item.id), label: item.name }))]

    return (
        <div className={`container ${styles.page}`}>
            <nav className={styles.breadcrumbs} aria-label="Навигация">
                <Link to={ROUTES.PROFILE}>Личный кабинет</Link>
                <span aria-hidden="true">/</span>
                <Link to={backLink}>Мои курсы</Link>
            </nav>

            <div className={styles.heading}>
                <h1>{id ? "Редактирование курса" : "Новый курс"}</h1>
                <p className={styles.muted}>
                    После отправки курс проверит администратор. Когда его опубликуют, он появится в каталоге.
                </p>
            </div>

            {course?.status === "rejected" && course.rejectionReason && (
                <Alert tone="warning">Курс отклонён. Причина: {course.rejectionReason}</Alert>
            )}
            {message && <Alert tone="danger">{message}</Alert>}

            <Card>
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <Input
                        label="Название курса"
                        value={form.title}
                        maxLength={LIMITS.title}
                        onChange={(event) => updateField("title", event.target.value)}
                        error={errors.title}
                        placeholder="Например, Разработка игр на Unity"
                    />
                    <Textarea
                        label="Описание"
                        value={form.description}
                        maxLength={LIMITS.description}
                        rows={4}
                        onChange={(event) => updateField("description", event.target.value)}
                        error={errors.description}
                        hint="Чему научатся студенты и чем закончится курс"
                    />
                    <Textarea
                        label="Программа курса (необязательно)"
                        value={form.program}
                        maxLength={LIMITS.program}
                        rows={6}
                        onChange={(event) => updateField("program", event.target.value)}
                        error={errors.program}
                        hint="Темы по неделям или модулям, каждая с новой строки"
                    />

                    <div className={styles.grid}>
                        <Input
                            label="Количество часов"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={1000}
                            value={form.hours}
                            onChange={(event) => updateField("hours", event.target.value)}
                            error={errors.hours}
                        />
                        <div className={styles.field}>
                            <Select
                                label="Факультет"
                                value={form.facultyId}
                                options={facultyOptions}
                                onChange={(event) => updateField("facultyId", event.target.value)}
                                aria-invalid={Boolean(errors.facultyId)}
                            />
                            {errors.facultyId && <span className={styles.error}>{errors.facultyId}</span>}
                        </div>
                        <div className={styles.field}>
                            <Select
                                label="Семестр"
                                value={form.semesterId}
                                options={semesterOptions}
                                onChange={(event) => updateField("semesterId", event.target.value)}
                                aria-invalid={Boolean(errors.semesterId)}
                            />
                            {errors.semesterId && <span className={styles.error}>{errors.semesterId}</span>}
                        </div>
                    </div>

                    <fieldset className={styles.formats}>
                        <legend>Форматы занятий</legend>
                        <div className={styles.formatList}>
                            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                                <Checkbox
                                    key={value}
                                    label={label}
                                    checked={form.formats.includes(value)}
                                    onChange={(event) => toggleFormat(value, event.target.checked)}
                                />
                            ))}
                        </div>
                        {errors.formats && <span className={styles.error}>{errors.formats}</span>}
                    </fieldset>

                    <div className={styles.actions}>
                        <Button variant="ghost" to={backLink} disabled={Boolean(saving)}>
                            Отмена
                        </Button>
                        <Button variant="outline" onClick={() => save(false)} disabled={Boolean(saving)} loading={saving === "draft"}>
                            Сохранить черновик
                        </Button>
                        <Button type="submit" disabled={Boolean(saving)} loading={saving === "submit"}>
                            Отправить на модерацию
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

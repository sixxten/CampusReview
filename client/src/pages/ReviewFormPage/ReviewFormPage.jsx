import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { courseApi, parseApiError, reviewApi } from "@/shared/api"
import { courseRoute, REVIEW_CRITERIA, REVIEW_MIN_TEXT, REVIEW_STATUS, ROUTES } from "@/shared/consts"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Checkbox } from "@/ui/Checkbox"
import { ScoreInput } from "@/ui/ScoreInput"
import { Select } from "@/ui/Select"
import { Spinner } from "@/ui/Spinner"
import { Textarea } from "@/ui/Textarea"
import styles from "./ReviewFormPage.module.css"

const TEXT_FIELDS = [
    { key: "pros", label: "Что понравилось", placeholder: "Чем курс был полезен, что запомнилось" },
    { key: "cons", label: "Что не понравилось", placeholder: "Что стоило бы улучшить" },
    { key: "advice", label: "Совет будущим студентам", placeholder: "Как лучше подготовиться, на что обратить внимание" }
]

function toForm(review) {
    const form = {
        semesterId: review?.semesterId ? String(review.semesterId) : "",
        pros: review?.pros || "",
        cons: review?.cons || "",
        advice: review?.advice || "",
        isAnonymous: review?.isAnonymous || false
    }
    for (const { key } of REVIEW_CRITERIA) form[key] = review?.[key] ?? null
    return form
}

function toPayload(form) {
    const payload = {
        semesterId: form.semesterId ? Number(form.semesterId) : null,
        pros: form.pros,
        cons: form.cons,
        advice: form.advice,
        isAnonymous: form.isAnonymous
    }
    for (const { key } of REVIEW_CRITERIA) payload[key] = form[key]
    return payload
}

function validateForSubmit(form) {
    const errors = {}
    if (!form.semesterId) errors.semesterId = "Укажите, в каком семестре проходили курс"
    for (const { key } of REVIEW_CRITERIA) {
        if (form[key] == null) errors[key] = "Поставьте оценку"
    }
    const textLength = TEXT_FIELDS.reduce((sum, { key }) => sum + form[key].trim().length, 0)
     if (textLength < REVIEW_MIN_TEXT) {
        errors.texts = `Напишите хотя бы пару предложений — в любом из полей ниже, от ${REVIEW_MIN_TEXT} символов`
    }
    return errors
}

export function ReviewFormPage() {
    const { id: courseId } = useParams()
    const navigate = useNavigate()

    const [loaded, setLoaded] = useState({ id: null, course: null, semesters: [], review: null, error: "" })
    const [form, setForm] = useState(toForm(null))
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState(null)
    const [saving, setSaving] = useState(null)

    const loading = loaded.id !== courseId

    useEffect(() => {
        let ignore = false
        Promise.all([courseApi.getCourse(courseId), courseApi.getFilterOptions(), reviewApi.getMy({ courseId })])
            .then(([course, options, reviews]) => {
                if (ignore) return
                const review = reviews[0] || null
                setLoaded({ id: courseId, course, semesters: options.semesters, review, error: "" })
                setForm(toForm(review))
            })
            .catch((err) => {
                if (!ignore) setLoaded({ id: courseId, course: null, semesters: [], review: null, error: parseApiError(err).message })
            })
        return () => {
            ignore = true
        }
    }, [courseId])

    const updateField = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
        setMessage(null)
    }

    const save = async (submit) => {
        setMessage(null)
        if (submit) {
            const found = validateForSubmit(form)
            setErrors(found)
            if (Object.keys(found).length > 0) {
                setMessage({ tone: "danger", text: "Заполните анкету полностью, чтобы отправить отзыв" })
                window.scrollTo({ top: 0, behavior: "smooth" })
                return
            }
        } else {
            setErrors({})
        }

        setSaving(submit ? "submit" : "draft")
        try {
            const payload = { ...toPayload(form), submit }
            const review = loaded.review
                ? await reviewApi.update(loaded.review.id, payload)
                : await reviewApi.create({ ...payload, courseId: Number(courseId) })

            if (submit) {
                navigate(courseRoute(courseId), {
                    state: { notice: "Отзыв отправлен на модерацию. После проверки он появится на странице курса." }
                })
                return
            }
            setLoaded((prev) => ({ ...prev, review }))
            setMessage({ tone: "success", text: "Черновик сохранён. Вернуться к нему можно со страницы курса." })
        } catch (err) {
            const { message: text, fieldErrors } = parseApiError(err)
            setErrors(fieldErrors)
            setMessage({ tone: "danger", text })
            window.scrollTo({ top: 0, behavior: "smooth" })
        } finally {
            setSaving(null)
        }
    }

    if (loading) {
        return (
            <div className={styles.loader}>
                <Spinner />
            </div>
        )
    }

    if (loaded.error) {
        return (
            <div className={`container ${styles.page}`}>
                <Alert tone="danger">{loaded.error}</Alert>
                <Link to={ROUTES.HOME}>Вернуться в каталог</Link>
            </div>
        )
    }

    const { course, review, semesters } = loaded

    if (review?.status === REVIEW_STATUS.PUBLISHED) {
        return (
            <div className={`container ${styles.page}`}>
                <Card className={styles.form}>
                    <h1>Ваш отзыв уже опубликован</h1>
                    <p className={styles.muted}>Спасибо! Его можно увидеть на странице курса «{course.title}».</p>
                    <Button to={courseRoute(courseId)}>К странице курса</Button>
                </Card>
            </div>
        )
    }

    return (
        <div className={`container ${styles.page}`}>
            <nav className={styles.breadcrumbs} aria-label="Навигационная цепочка">
                <Link to={ROUTES.HOME}>Каталог курсов</Link>
                <span aria-hidden="true">/</span>
                <Link to={courseRoute(courseId)}>{course.title}</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Отзыв</span>
            </nav>

            <Card
                as="form"
                className={styles.form}
                noValidate
                onSubmit={(event) => {
                    event.preventDefault()
                    save(true)
                }}
            >
                <div className={styles.heading}>
                    <h1>Отзыв о курсе</h1>
                    <p className={styles.muted}>
                        {course.title} · {course.teacher.firstName} {course.teacher.lastName}
                    </p>
                </div>

                {review?.status === REVIEW_STATUS.REJECTED && (
                    <Alert tone="warning">
                        <strong>Модератор отклонил отзыв:</strong> {review.rejectionReason || "причина не указана"}. Исправьте его и отправьте снова.
                    </Alert>
                )}
                {review?.status === REVIEW_STATUS.PENDING && (
                    <Alert tone="info">Отзыв уже на модерации. Если исправите его, он будет проверен заново.</Alert>
                )}
                {message && <Alert tone={message.tone}>{message.text}</Alert>}

                <Select
                    label="Когда вы проходили курс"
                    value={form.semesterId}
                    onChange={(event) => updateField("semesterId", event.target.value)}
                    options={[
                        { value: "", label: "Выберите семестр" },
                        ...semesters.map((semester) => ({ value: String(semester.id), label: semester.name }))
                    ]}
                    className={styles.semester}
                />
                {errors.semesterId && <p className={styles.error}>{errors.semesterId}</p>}

                <section className={styles.block} aria-labelledby="scores-title">
                    <h2 id="scores-title">Оценки</h2>
                    {REVIEW_CRITERIA.map((criterion) => (
                        <ScoreInput
                            key={criterion.key}
                            label={criterion.label}
                            hint={criterion.hint}
                            value={form[criterion.key]}
                            onChange={(value) => updateField(criterion.key, value)}
                            error={errors[criterion.key]}
                        />
                    ))}
                </section>

                <section className={styles.block} aria-labelledby="texts-title">
                    <h2 id="texts-title">Ваш опыт</h2>
                    {errors.texts && <p className={styles.textsError}>{errors.texts}</p>}
                    {TEXT_FIELDS.map((field) => (
                        <Textarea
                            key={field.key}
                            label={field.label}
                            placeholder={field.placeholder}
                            maxLength={2000}
                            value={form[field.key]}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            error={errors[field.key]}
                        />
                    ))}
                </section>

                <Checkbox
                    label="Опубликовать анонимно — имя не будет показано"
                    checked={form.isAnonymous}
                    onChange={(event) => updateField("isAnonymous", event.target.checked)}
                />

                <div className={styles.actions}>
                    <Button variant="outline" disabled={saving !== null} loading={saving === "draft"} onClick={() => save(false)}>
                        Сохранить черновик
                    </Button>
                    <Button type="submit" disabled={saving !== null} loading={saving === "submit"}>
                        Отправить на модерацию
                    </Button>
                </div>
            </Card>
        </div>
    )
}

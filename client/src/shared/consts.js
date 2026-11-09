export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTRATION: "/registration",
    PROFILE: "/profile",
    ADMIN: "/admin",
    COURSE: "/courses/:id",
    REVIEW_FORM: "/courses/:id/review"
}

export const courseRoute = (id) => ROUTES.COURSE.replace(":id", id)

export const reviewFormRoute = (id) => ROUTES.REVIEW_FORM.replace(":id", id)

export const ROLES = {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin"
}

export const ROLE_LABELS = {
    student: "Студент",
    teacher: "Преподаватель",
    admin: "Администратор"
}

export const USER_STATUS = {
    ACTIVE: "active",
    PENDING: "pending",
    BLOCKED: "blocked"
}

export const USER_STATUS_LABELS = {
    active: "Активен",
    pending: "Ожидает подтверждения",
    blocked: "Заблокирован"
}

export const USER_STATUS_TONE = {
    active: "success",
    pending: "warning",
    blocked: "danger"
}

export const FORMAT_LABELS = {
    lectures: "Лекции",
    seminars: "Семинары",
    projects: "Проекты"
}

export const DIFFICULTY_LEVELS = [
    { value: "low", label: "Низкая" },
    { value: "medium", label: "Средняя" },
    { value: "high", label: "Высокая" }
]

export const COURSE_SORT_OPTIONS = [
    { value: "rating", label: "По рейтингу" },
    { value: "reviews", label: "По количеству отзывов" },
    { value: "easy", label: "Сначала лёгкие" },
    { value: "hard", label: "Сначала сложные" },
    { value: "title", label: "По названию" }
]

export const REVIEW_CRITERIA = [
    { key: "usefulness", label: "Полезность", hint: "1 — бесполезно, 5 — очень полезно" },
    { key: "difficulty", label: "Сложность", hint: "1 — очень легко, 5 — очень сложно" },
    { key: "workload", label: "Нагрузка", hint: "1 — почти нет заданий, 5 — очень много" },
    { key: "atmosphere", label: "Атмосфера", hint: "1 — некомфортно, 5 — отличная атмосфера" },
    { key: "practicalValue", label: "Практическая ценность", hint: "1 — только теория, 5 — сразу пригодится" }
]

export const REVIEW_STATUS = {
    DRAFT: "draft",
    PENDING: "pending",
    PUBLISHED: "published",
    REJECTED: "rejected"
}

export const REVIEW_STATUS_LABELS = {
    draft: "Черновик",
    pending: "На модерации",
    published: "Опубликован",
    rejected: "Отклонён"
}

export const REVIEW_STATUS_TONE = {
    draft: "neutral",
    pending: "warning",
    published: "success",
    rejected: "danger"
}

export const REVIEW_SORT_OPTIONS = [
    { value: "new", label: "Сначала новые" },
    { value: "high", label: "Сначала высокие оценки" },
    { value: "low", label: "Сначала низкие оценки" }
]

export const REVIEW_MIN_TEXT = 20

export const COMPLAINT_REASONS = [
    { value: "offensive", label: "Оскорбления" },
    { value: "irrelevant", label: "Не о курсе" },
    { value: "false_info", label: "Недостоверно" },
    { value: "spam", label: "Реклама или спам" },
    { value: "other", label: "Другое" }
]

export const COMPLAINT_REASON_LABELS = Object.fromEntries(COMPLAINT_REASONS.map((item) => [item.value, item.label]))

export const COMPLAINT_STATUS_LABELS = {
    new: "Новая",
    accepted: "Принята",
    rejected: "Отклонена"
}

export const COMPLAINT_STATUS_TONE = {
    new: "warning",
    accepted: "danger",
    rejected: "neutral"
}

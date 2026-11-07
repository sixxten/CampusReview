export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTRATION: "/registration",
    PROFILE: "/profile",
    ADMIN: "/admin",
    COURSE: "/courses/:id"
}

export const courseRoute = (id) => ROUTES.COURSE.replace(":id", id)

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

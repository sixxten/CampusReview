export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTRATION: "/registration",
    PROFILE: "/profile",
    ADMIN: "/admin"
}

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

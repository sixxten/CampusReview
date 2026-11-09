const { ref, body, ok, message, errors, bearer } = require("../helpers")

const auth = (summary, description, schema, example, status = 200) => ({
    tags: ["Авторизация"],
    summary,
    description,
    requestBody: body(schema, example),
    responses: {
        [status]: {
            ...ok("Успешно. Refresh-токен установлен в cookie refreshToken", ref("AuthResponse")),
            headers: { "Set-Cookie": { schema: { type: "string", example: "refreshToken=eyJ...; Path=/api/user; HttpOnly; SameSite=Lax" } } }
        },
        ...errors(400)
    }
})

module.exports = {
    "/user/registration": {
        post: auth(
            "Регистрация",
            "Студент сразу получает статус active. Преподаватель — pending, пока его не подтвердит администратор.",
            {
                type: "object",
                required: ["email", "password", "firstName", "lastName"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8, maxLength: 64 },
                    firstName: { type: "string", maxLength: 50 },
                    lastName: { type: "string", maxLength: 50 },
                    role: { type: "string", enum: ["student", "teacher"], default: "student" }
                }
            },
            { email: "new.student@campus.ru", password: "password123", firstName: "Анна", lastName: "Смирнова", role: "student" },
            201
        )
    },
    "/user/login": {
        post: auth(
            "Вход",
            "Возвращает access-токен (15 минут) и ставит refresh-токен (30 дней) в httpOnly-cookie. Демо-пароль у всех пользователей из сида: password123.",
            {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string", format: "email" }, password: { type: "string" } }
            },
            { email: "m.kuznetsova@campus.ru", password: "password123" }
        )
    },
    "/user/refresh": {
        post: {
            tags: ["Авторизация"],
            summary: "Обновить access-токен",
            description: "Берёт refresh-токен из cookie, выдаёт новую пару токенов (старый refresh-токен становится недействительным).",
            security: [{ refreshCookie: [] }],
            responses: { 200: ok("Новая пара токенов", ref("AuthResponse")), ...errors(401) }
        }
    },
    "/user/logout": {
        post: {
            tags: ["Авторизация"],
            summary: "Выход",
            description: "Удаляет refresh-токен из базы и очищает cookie.",
            security: [{ refreshCookie: [] }],
            responses: { 200: message("Вы вышли из аккаунта") }
        }
    },
    "/user/me": {
        get: {
            tags: ["Профиль"],
            summary: "Текущий пользователь",
            security: bearer,
            responses: { 200: ok("Данные пользователя", ref("User")), ...errors(401) }
        },
        patch: {
            tags: ["Профиль"],
            summary: "Изменить имя и фамилию",
            security: bearer,
            requestBody: body(
                {
                    type: "object",
                    required: ["firstName", "lastName"],
                    properties: { firstName: { type: "string", maxLength: 50 }, lastName: { type: "string", maxLength: 50 } }
                },
                { firstName: "Мария", lastName: "Кузнецова" }
            ),
            responses: { 200: ok("Обновлённый пользователь", ref("User")), ...errors(400, 401) }
        }
    },
    "/user/me/password": {
        patch: {
            tags: ["Профиль"],
            summary: "Сменить пароль",
            description: "После смены пароля все остальные сессии пользователя завершаются.",
            security: bearer,
            requestBody: body(
                {
                    type: "object",
                    required: ["currentPassword", "newPassword"],
                    properties: { currentPassword: { type: "string" }, newPassword: { type: "string", minLength: 8, maxLength: 64 } }
                },
                { currentPassword: "password123", newPassword: "newPassword456" }
            ),
            responses: { 200: message("Пароль изменён"), ...errors(400, 401) }
        }
    }
}

const { schemas } = require("./schemas")

const paths = {
    ...require("./paths/user"),
    ...require("./paths/courses"),
    ...require("./paths/reviews"),
    ...require("./paths/favorites"),
    ...require("./paths/complaints"),
    ...require("./paths/notifications"),
    ...require("./paths/teacher"),
    ...require("./paths/admin")
}

module.exports = {
    openapi: "3.0.3",
    info: {
        title: "CampusReview API",
        version: "1.0.0",
        description: [
            "Платформа отзывов о курсах и преподавателях.",
            "",
            "**Как попробовать защищённые запросы:**",
            "1. Выполните `POST /user/login` (например, `m.kuznetsova@campus.ru` / `password123` — студент, `i.ivanov@campus.ru` — преподаватель).",
            "2. Скопируйте `accessToken` из ответа.",
            "3. Нажмите **Authorize** вверху и вставьте токен.",
            "",
            "Access-токен живёт 15 минут, затем вызовите `POST /user/refresh` — refresh-токен браузер передаст в cookie сам."
        ].join("\n")
    },
    servers: [{ url: "/api", description: "Текущий сервер" }],
    tags: [
        { name: "Авторизация", description: "Регистрация, вход, refresh-токены" },
        { name: "Профиль", description: "Личные данные и пароль" },
        { name: "Каталог курсов", description: "Публичные данные: курсы, отзывы, статистика" },
        { name: "Отзывы (студент)", description: "Черновик → модерация → публикация" },
        { name: "Избранное (студент)" },
        { name: "Жалобы", description: "Жалобы на опубликованные отзывы" },
        { name: "Уведомления", description: "Уведомления о смене статусов" },
        { name: "Преподаватель", description: "Свои курсы и ответы на отзывы" },
        { name: "Администратор", description: "Модерация отзывов, курсов, жалоб и пользователей" }
    ],
    paths,
    components: {
        securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "accessToken из ответа /user/login" },
            refreshCookie: { type: "apiKey", in: "cookie", name: "refreshToken", description: "Ставится сервером автоматически" }
        },
        schemas
    }
}

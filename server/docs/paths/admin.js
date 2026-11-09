const { ref, body, ok, errors, pathId, queryParam, pageParams, page, bearer } = require("../helpers")
const { ROLES, USER_STATUSES } = require("../schemas")

const tags = ["Администратор"]

const search = (description) => queryParam("search", { type: "string", maxLength: 100 }, description)

const moderationStatus = queryParam("status", { type: "string", enum: ["pending", "published", "rejected"], default: "pending" }, "pending — очередь, остальные — история")

const decision = (exampleReason) =>
    body(
        {
            type: "object",
            required: ["status"],
            properties: {
                status: { type: "string", enum: ["published", "rejected"] },
                rejectionReason: { type: "string", minLength: 5, maxLength: 500, description: "Обязательна при status=rejected" }
            }
        },
        { status: "rejected", rejectionReason: exampleReason }
    )

module.exports = {
    "/admin/stats": {
        get: {
            tags,
            summary: "Счётчики для вкладок админ-панели",
            security: bearer,
            responses: {
                200: ok("Сколько ждёт решения", {
                    type: "object",
                    properties: {
                        pendingReviews: { type: "integer", example: 3 },
                        pendingTeachers: { type: "integer", example: 1 },
                        pendingComplaints: { type: "integer", example: 2 },
                        pendingCourses: { type: "integer", example: 2 }
                    }
                }),
                ...errors(401, 403)
            }
        }
    },
    "/admin/users": {
        get: {
            tags,
            summary: "Пользователи",
            security: bearer,
            parameters: [
                search("Имя, фамилия или email"),
                queryParam("role", { type: "string", enum: ROLES }, "Роль"),
                queryParam("status", { type: "string", enum: USER_STATUSES }, "Статус"),
                ...pageParams(100)
            ],
            responses: {
                200: ok("Страница пользователей", page("users", ref("AdminUser"), { pendingCount: { type: "integer", example: 1 } })),
                ...errors(400, 401, 403)
            }
        }
    },
    "/admin/users/{id}/status": {
        patch: {
            tags,
            summary: "Подтвердить, заблокировать или разблокировать",
            description: "active — подтвердить преподавателя или разблокировать (пользователь получит уведомление), blocked — заблокировать и завершить все сессии.",
            security: bearer,
            parameters: [pathId("id", "id пользователя")],
            requestBody: body({ type: "object", required: ["status"], properties: { status: { type: "string", enum: ["active", "blocked"] } } }, { status: "active" }),
            responses: { 200: ok("Пользователь", ref("AdminUser")), ...errors(400, 401, 403, 404) }
        }
    },
    "/admin/reviews": {
        get: {
            tags,
            summary: "Отзывы на модерации и история",
            security: bearer,
            parameters: [search("Название курса или имя автора"), moderationStatus, ...pageParams(100)],
            responses: { 200: ok("Страница отзывов", page("reviews", ref("ModerationReview"))), ...errors(400, 401, 403) }
        }
    },
    "/admin/reviews/{id}": {
        patch: {
            tags,
            summary: "Опубликовать или отклонить отзыв",
            description: "Только отзыв в статусе pending. При публикации пересчитывается рейтинг курса, автор и преподаватель получают уведомления.",
            security: bearer,
            parameters: [pathId("id", "id отзыва")],
            requestBody: decision("Оскорбления или переход на личности"),
            responses: { 200: ok("Отзыв", ref("Review")), ...errors(400, 401, 403, 404) }
        }
    },
    "/admin/courses": {
        get: {
            tags,
            summary: "Курсы на модерации и история",
            security: bearer,
            parameters: [search("Название курса или имя преподавателя"), moderationStatus, ...pageParams(100)],
            responses: { 200: ok("Страница курсов", page("courses", ref("ModerationCourse"))), ...errors(400, 401, 403) }
        }
    },
    "/admin/courses/{id}": {
        patch: {
            tags,
            summary: "Опубликовать или отклонить курс",
            description: "Только курс в статусе pending. Преподаватель получает уведомление.",
            security: bearer,
            parameters: [pathId("id", "id курса")],
            requestBody: decision("Нет программы курса"),
            responses: { 200: ok("Курс", ref("Course")), ...errors(400, 401, 403, 404) }
        }
    },
    "/admin/complaints": {
        get: {
            tags,
            summary: "Жалобы",
            security: bearer,
            parameters: [
                queryParam("status", { type: "string", enum: ["new", "accepted", "rejected"], default: "new" }, "Статус жалобы"),
                ...pageParams(100)
            ],
            responses: { 200: ok("Страница жалоб", page("complaints", ref("Complaint"))), ...errors(400, 401, 403) }
        }
    },
    "/admin/complaints/{id}": {
        patch: {
            tags,
            summary: "Рассмотреть жалобу",
            description: "accepted — отзыв скрывается (status=rejected), рейтинг курса пересчитывается, остальные новые жалобы на этот отзыв тоже принимаются. rejected — отзыв остаётся. Все участники получают уведомления.",
            security: bearer,
            parameters: [pathId("id", "id жалобы")],
            requestBody: body({ type: "object", required: ["status"], properties: { status: { type: "string", enum: ["accepted", "rejected"] } } }, { status: "accepted" }),
            responses: { 200: ok("Жалоба", ref("Complaint")), ...errors(400, 401, 403, 404) }
        }
    }
}

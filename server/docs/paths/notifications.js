const { ref, ok, errors, pathId, queryParam, pageParams, page, bearer } = require("../helpers")

const tags = ["Уведомления"]

module.exports = {
    "/notifications": {
        get: {
            tags,
            summary: "Мои уведомления",
            description: "Для всех ролей. Новые сверху.",
            security: bearer,
            parameters: [queryParam("unread", { type: "boolean" }, "Только непрочитанные"), ...pageParams()],
            responses: {
                200: ok("Страница уведомлений", page("notifications", ref("Notification"), { unreadCount: { type: "integer", example: 3 } })),
                ...errors(400, 401)
            }
        }
    },
    "/notifications/unread-count": {
        get: {
            tags,
            summary: "Число непрочитанных",
            description: "Клиент опрашивает каждые 30 секунд для счётчика на колокольчике.",
            security: bearer,
            responses: { 200: ok("Счётчик", { type: "object", properties: { count: { type: "integer" } } }, { count: 3 }), ...errors(401) }
        }
    },
    "/notifications/read-all": {
        patch: {
            tags,
            summary: "Прочитать все",
            security: bearer,
            responses: { 200: ok("Готово", { type: "object", properties: { success: { type: "boolean" } } }, { success: true }), ...errors(401) }
        }
    },
    "/notifications/{id}/read": {
        patch: {
            tags,
            summary: "Отметить прочитанным",
            security: bearer,
            parameters: [pathId("id", "id уведомления")],
            responses: { 200: ok("Уведомление", ref("Notification")), ...errors(400, 401, 404) }
        }
    }
}

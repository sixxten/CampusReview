const { ref, ok, errors, pathId, bearer } = require("../helpers")

const tags = ["Избранное (студент)"]

const toggled = (isFavorite) =>
    ok("Готово", { type: "object", properties: { courseId: { type: "integer" }, isFavorite: { type: "boolean" } } }, { courseId: 1, isFavorite })

module.exports = {
    "/favorites": {
        get: {
            tags,
            summary: "Избранные курсы",
            security: bearer,
            responses: { 200: ok("Курсы", { type: "array", items: ref("Course") }), ...errors(401, 403) }
        }
    },
    "/favorites/ids": {
        get: {
            tags,
            summary: "Только id избранных курсов",
            description: "Чтобы быстро отметить сердечки в каталоге.",
            security: bearer,
            responses: { 200: ok("id курсов", { type: "array", items: { type: "integer" } }, [1, 4, 7]), ...errors(401, 403) }
        }
    },
    "/favorites/{courseId}": {
        post: {
            tags,
            summary: "Добавить в избранное",
            security: bearer,
            parameters: [pathId("courseId", "id курса")],
            responses: { 201: toggled(true), ...errors(400, 401, 403, 404) }
        },
        delete: {
            tags,
            summary: "Убрать из избранного",
            security: bearer,
            parameters: [pathId("courseId", "id курса")],
            responses: { 200: toggled(false), ...errors(400, 401, 403) }
        }
    }
}

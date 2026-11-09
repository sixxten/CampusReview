const { ref, body, ok, message, errors, pathId, queryParam, bearer } = require("../helpers")

const tags = ["Отзывы (студент)"]

const example = {
    semesterId: 1,
    usefulness: 5,
    difficulty: 3,
    workload: 3,
    atmosphere: 5,
    practicalValue: 5,
    pros: "Много практики, понятные лекции",
    cons: "Жёсткие дедлайны по проекту",
    advice: "Начинайте проект заранее",
    isAnonymous: false,
    submit: true
}

module.exports = {
    "/reviews/my": {
        get: {
            tags,
            summary: "Мои отзывы",
            description: "Все отзывы студента в любом статусе: черновики, на модерации, опубликованные, отклонённые.",
            security: bearer,
            parameters: [
                queryParam("status", { type: "string", enum: ["draft", "pending", "published", "rejected"] }, "Статус"),
                queryParam("courseId", { type: "integer" }, "Курс")
            ],
            responses: { 200: ok("Список отзывов", { type: "array", items: ref("MyReview") }), ...errors(401, 403) }
        }
    },
    "/reviews": {
        post: {
            tags,
            summary: "Создать отзыв",
            description: "submit=false — черновик (draft), submit=true — на модерацию (pending). Один отзыв на курс от студента.",
            security: bearer,
            requestBody: body({ allOf: [ref("ReviewInput"), { type: "object", required: ["courseId"], properties: { courseId: { type: "integer" } } }] }, { courseId: 1, ...example }),
            responses: { 201: ok("Созданный отзыв", ref("Review")), ...errors(400, 401, 403, 404) }
        }
    },
    "/reviews/{id}": {
        put: {
            tags,
            summary: "Изменить отзыв",
            description: "Можно менять черновик, отзыв на модерации или отклонённый. Опубликованный — только удалить.",
            security: bearer,
            parameters: [pathId("id", "id отзыва")],
            requestBody: body(ref("ReviewInput"), example),
            responses: { 200: ok("Обновлённый отзыв", ref("Review")), ...errors(400, 401, 403, 404) }
        },
        delete: {
            tags,
            summary: "Удалить отзыв",
            description: "Если отзыв был опубликован, рейтинг курса пересчитывается.",
            security: bearer,
            parameters: [pathId("id", "id отзыва")],
            responses: { 200: message("Отзыв удалён"), ...errors(401, 403, 404) }
        }
    }
}

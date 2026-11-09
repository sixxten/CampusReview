const { ref, body, ok, message, errors, pathId, queryParam, pageParams, page, bearer } = require("../helpers")

const tags = ["Преподаватель"]

const courseExample = {
    title: "Разработка игр на Unity",
    description: "Практический курс: игровой цикл, физика, анимации и сборка под разные платформы.",
    program: "1. Знакомство с Unity\n2. Скрипты на C#\n3. Защита проекта",
    hours: 108,
    formats: ["lectures", "projects"],
    facultyId: 1,
    semesterId: 2,
    submit: true
}

module.exports = {
    "/teacher/courses": {
        get: {
            tags,
            summary: "Мои курсы и сводка",
            description: "Курсы преподавателя во всех статусах.",
            security: bearer,
            responses: {
                200: ok("Курсы и сводка", {
                    type: "object",
                    properties: {
                        courses: { type: "array", items: ref("TeacherCourse") },
                        summary: {
                            type: "object",
                            properties: {
                                courses: { type: "integer", example: 3 },
                                published: { type: "integer", example: 2 },
                                reviews: { type: "integer", example: 7 },
                                unanswered: { type: "integer", example: 4 },
                                rating: { type: "number", example: 4.3 }
                            }
                        }
                    }
                }),
                ...errors(401, 403)
            }
        },
        post: {
            tags,
            summary: "Создать курс",
            description: "submit=false — черновик, submit=true — на модерацию. Только для подтверждённого преподавателя.",
            security: bearer,
            requestBody: body(ref("CourseInput"), courseExample),
            responses: { 201: ok("Созданный курс", ref("Course")), ...errors(400, 401, 403) }
        }
    },
    "/teacher/courses/{id}": {
        get: {
            tags,
            summary: "Мой курс для редактирования",
            security: bearer,
            parameters: [pathId("id", "id курса")],
            responses: { 200: ok("Курс", ref("TeacherCourse")), ...errors(401, 403, 404) }
        },
        put: {
            tags,
            summary: "Изменить курс",
            description: "Черновик, курс на модерации или отклонённый. Опубликованный курс изменить нельзя.",
            security: bearer,
            parameters: [pathId("id", "id курса")],
            requestBody: body(ref("CourseInput"), courseExample),
            responses: { 200: ok("Обновлённый курс", ref("Course")), ...errors(400, 401, 403, 404) }
        },
        delete: {
            tags,
            summary: "Удалить курс",
            description: "Только неопубликованный.",
            security: bearer,
            parameters: [pathId("id", "id курса")],
            responses: { 200: message("Курс удалён"), ...errors(400, 401, 403, 404) }
        }
    },
    "/teacher/reviews": {
        get: {
            tags,
            summary: "Отзывы о моих курсах",
            security: bearer,
            parameters: [
                queryParam("courseId", { type: "integer" }, "Курс"),
                queryParam("replied", { type: "string", enum: ["yes", "no"] }, "С ответом или без"),
                ...pageParams()
            ],
            responses: { 200: ok("Страница отзывов", page("reviews", ref("PublicReview"))), ...errors(400, 401, 403) }
        }
    },
    "/teacher/reviews/{id}/reply": {
        put: {
            tags,
            summary: "Ответить на отзыв или изменить ответ",
            description: "Один ответ на отзыв. При первом ответе студент получает уведомление.",
            security: bearer,
            parameters: [pathId("id", "id отзыва")],
            requestBody: body(
                { type: "object", required: ["text"], properties: { text: { type: "string", minLength: 10, maxLength: 1000 } } },
                { text: "Спасибо за отзыв! Учли замечание про дедлайны." }
            ),
            responses: { 200: ok("Ответ", ref("Reply")), ...errors(400, 401, 403, 404) }
        },
        delete: {
            tags,
            summary: "Удалить ответ",
            security: bearer,
            parameters: [pathId("id", "id отзыва")],
            responses: { 200: message("Ответ удалён"), ...errors(401, 403, 404) }
        }
    }
}

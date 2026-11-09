const { ref, ok, errors, pathId, queryParam, pageParams, page } = require("../helpers")
const { FORMATS } = require("../schemas")

const tags = ["Каталог курсов"]

module.exports = {
    "/courses": {
        get: {
            tags,
            summary: "Каталог курсов с поиском и фильтрами",
            description: "Только опубликованные курсы. Доступно без авторизации.",
            parameters: [
                queryParam("search", { type: "string", maxLength: 100 }, "Поиск по названию курса и имени преподавателя"),
                queryParam("facultyId", { type: "integer" }, "Факультет"),
                queryParam("semesterId", { type: "integer" }, "Семестр"),
                queryParam("formats", { type: "string", example: "lectures,projects" }, `Форматы через запятую: ${FORMATS.join(", ")}. Курс должен содержать все указанные`),
                queryParam("minRating", { type: "number", minimum: 0, maximum: 5 }, "Минимальный рейтинг"),
                queryParam("difficulty", { type: "string", enum: ["low", "medium", "high"] }, "Сложность: low < 2.5, medium < 3.7, high ≥ 3.7"),
                queryParam("sort", { type: "string", enum: ["rating", "reviews", "easy", "hard", "title"] }, "Сортировка"),
                ...pageParams()
            ],
            responses: { 200: ok("Страница каталога", page("courses", ref("Course"))), ...errors(400) }
        }
    },
    "/courses/filters": {
        get: {
            tags,
            summary: "Значения для фильтров",
            description: "Список факультетов и семестров для выпадающих списков.",
            responses: {
                200: ok("Факультеты и семестры", {
                    type: "object",
                    properties: {
                        faculties: { type: "array", items: ref("Faculty") },
                        semesters: { type: "array", items: ref("Semester") }
                    }
                })
            }
        }
    },
    "/courses/{id}": {
        get: {
            tags,
            summary: "Страница курса",
            parameters: [pathId("id", "id курса")],
            responses: { 200: ok("Курс", ref("Course")), ...errors(400, 404) }
        }
    },
    "/courses/{id}/reviews": {
        get: {
            tags,
            summary: "Опубликованные отзывы курса",
            description: "У анонимных отзывов author = null. Ответ преподавателя — в поле reply.",
            parameters: [
                pathId("id", "id курса"),
                queryParam("semesterId", { type: "integer" }, "Семестр, в котором проходили курс"),
                queryParam("rating", { type: "integer", minimum: 1, maximum: 5 }, "Итоговая оценка около этого числа (±0.5)"),
                queryParam("withText", { type: "boolean" }, "Только отзывы с текстом"),
                queryParam("sort", { type: "string", enum: ["new", "high", "low"], default: "new" }, "Сортировка"),
                ...pageParams()
            ],
            responses: { 200: ok("Страница отзывов", page("reviews", ref("PublicReview"))), ...errors(400, 404) }
        }
    },
    "/courses/{id}/stats": {
        get: {
            tags,
            summary: "Агрегированные оценки курса",
            description: "Средние по 5 критериям и распределение итоговых оценок.",
            parameters: [pathId("id", "id курса")],
            responses: { 200: ok("Статистика", ref("CourseStats")), ...errors(400, 404) }
        }
    }
}

const { param, query } = require("express-validator")

const COURSE_FORMATS = ["lectures", "seminars", "projects"]
const DIFFICULTY_LEVELS = ["low", "medium", "high"]
const SORT_OPTIONS = ["rating", "reviews", "easy", "hard", "title"]

const getCoursesValidator = [
    query("search").optional().trim().isLength({ max: 100 }).withMessage("Слишком длинный запрос"),
    query("facultyId").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("Некорректный факультет").toInt(),
    query("semesterId").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("Некорректный семестр").toInt(),
    query("formats")
        .optional({ values: "falsy" })
        .customSanitizer((value) => String(value).split(",").filter(Boolean))
        .custom((formats) => formats.every((format) => COURSE_FORMATS.includes(format)))
        .withMessage("Неизвестный формат курса"),
    query("minRating").optional({ values: "falsy" }).isFloat({ min: 0, max: 5 }).withMessage("Рейтинг от 0 до 5").toFloat(),
    query("difficulty").optional({ values: "falsy" }).isIn(DIFFICULTY_LEVELS).withMessage("Неизвестный уровень сложности"),
    query("sort").optional({ values: "falsy" }).isIn(SORT_OPTIONS).withMessage("Неизвестная сортировка"),
    query("page").optional().isInt({ min: 1 }).withMessage("Некорректная страница").toInt(),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit от 1 до 50").toInt()
]

const getCourseValidator = [param("id").isInt({ min: 1 }).withMessage("Некорректный id курса").toInt()]

module.exports = { getCoursesValidator, getCourseValidator }

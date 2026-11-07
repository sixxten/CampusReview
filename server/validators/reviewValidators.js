const { body, param, query } = require("express-validator")

const REVIEW_STATUSES = ["draft", "pending", "published", "rejected"]
const SCORE_FIELDS = ["usefulness", "difficulty", "workload", "atmosphere", "practicalValue"]
const TEXT_FIELDS = ["pros", "cons", "advice"]

const reviewBody = [
    body("semesterId").optional({ values: "null" }).isInt({ min: 1 }).withMessage("Некорректный семестр").toInt(),
    ...SCORE_FIELDS.map((name) =>
        body(name).optional({ values: "null" }).isInt({ min: 1, max: 5 }).withMessage("Оценка от 1 до 5").toInt()
    ),
    ...TEXT_FIELDS.map((name) =>
        body(name)
            .optional({ values: "null" })
            .isString().withMessage("Должно быть текстом")
            .trim()
            .isLength({ max: 2000 }).withMessage("Не больше 2000 символов")
    ),
    body("isAnonymous").optional().isBoolean().withMessage("isAnonymous — true или false").toBoolean(),
    body("submit").optional().isBoolean().withMessage("submit — true или false").toBoolean()
]

const idParam = param("id").isInt({ min: 1 }).withMessage("Некорректный id").toInt()

const createReviewValidator = [
    body("courseId").isInt({ min: 1 }).withMessage("Не указан курс").toInt(),
    ...reviewBody
]

const updateReviewValidator = [idParam, ...reviewBody]

const reviewIdValidator = [idParam]

const myReviewsValidator = [
    query("status").optional({ values: "falsy" }).isIn(REVIEW_STATUSES).withMessage("Неизвестный статус"),
    query("courseId").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("Некорректный курс").toInt()
]

const courseReviewsValidator = [
    idParam,
    query("semesterId").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("Некорректный семестр").toInt(),
    query("rating").optional({ values: "falsy" }).isInt({ min: 1, max: 5 }).withMessage("Оценка от 1 до 5").toInt(),
    query("withText").optional({ values: "falsy" }).isBoolean().withMessage("withText — true или false").toBoolean(),
    query("sort").optional({ values: "falsy" }).isIn(["new", "high", "low"]).withMessage("Неизвестная сортировка"),
    query("page").optional().isInt({ min: 1 }).withMessage("Некорректная страница").toInt(),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit от 1 до 50").toInt()
]

module.exports = {
    createReviewValidator,
    updateReviewValidator,
    reviewIdValidator,
    myReviewsValidator,
    courseReviewsValidator,
    courseStatsValidator: [idParam]
}

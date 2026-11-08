const { body, param, query } = require("express-validator")

const ROLES = ["student", "teacher", "admin"]
const STATUSES = ["active", "pending", "blocked"]
const MODERATION_STATUSES = ["pending", "published", "rejected"]

const pagination = [
    query("page").optional().isInt({ min: 1 }).withMessage("Некорректная страница").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit от 1 до 100").toInt()
]

const searchQuery = query("search").optional().trim().isLength({ max: 100 }).withMessage("Слишком длинный запрос")

const getUsersValidator = [
    searchQuery,
    query("role").optional({ values: "falsy" }).isIn(ROLES).withMessage("Неизвестная роль"),
    query("status").optional({ values: "falsy" }).isIn(STATUSES).withMessage("Неизвестный статус"),
    ...pagination
]

const updateStatusValidator = [
    param("id").isInt({ min: 1 }).withMessage("Некорректный id").toInt(),
    body("status").isIn(["active", "blocked"]).withMessage("Статус может быть только active или blocked")
]

const getReviewsValidator = [
    searchQuery,
    query("status").optional({ values: "falsy" }).isIn(MODERATION_STATUSES).withMessage("Неизвестный статус отзыва"),
    ...pagination
]

const moderateReviewValidator = [
    param("id").isInt({ min: 1 }).withMessage("Некорректный id").toInt(),
    body("status").isIn(["published", "rejected"]).withMessage("Решение: published или rejected"),
    body("rejectionReason")
        .if(body("status").equals("rejected"))
        .isString().withMessage("Укажите причину отклонения")
        .trim()
        .isLength({ min: 5, max: 500 }).withMessage("Причина — от 5 до 500 символов")
]

module.exports = {
    getUsersValidator,
    updateStatusValidator,
    getReviewsValidator,
    moderateReviewValidator
}

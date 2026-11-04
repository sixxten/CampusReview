const { body, param, query } = require("express-validator")

const ROLES = ["student", "teacher", "admin"]
const STATUSES = ["active", "pending", "blocked"]

const getUsersValidator = [
    query("search").optional().trim().isLength({ max: 100 }).withMessage("Слишком длинный запрос"),
    query("role").optional({ values: "falsy" }).isIn(ROLES).withMessage("Неизвестная роль"),
    query("status").optional({ values: "falsy" }).isIn(STATUSES).withMessage("Неизвестный статус"),
    query("page").optional().isInt({ min: 1 }).withMessage("Некорректная страница").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit от 1 до 100").toInt()
]

const updateStatusValidator = [
    param("id").isInt({ min: 1 }).withMessage("Некорректный id").toInt(),
    body("status").isIn(["active", "blocked"]).withMessage("Статус может быть только active или blocked")
]

module.exports = { getUsersValidator, updateStatusValidator }

const { param, query } = require("express-validator")

const getNotificationsValidator = [
    query("unread").optional({ values: "falsy" }).isBoolean().withMessage("unread: true или false").toBoolean(),
    query("page").optional().isInt({ min: 1 }).withMessage("Некорректная страница").toInt(),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit от 1 до 50").toInt()
]

const notificationIdValidator = [param("id").isInt({ min: 1 }).withMessage("Некорректный id").toInt()]

module.exports = { getNotificationsValidator, notificationIdValidator }

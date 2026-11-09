const { body, param, query } = require("express-validator")

const REPLY_MIN = 10
const REPLY_MAX = 1000

const getReviewsValidator = [
    query("courseId").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("Некорректный курс").toInt(),
    query("replied").optional({ values: "falsy" }).isIn(["yes", "no"]).withMessage("replied: yes или no"),
    query("page").optional().isInt({ min: 1 }).withMessage("Некорректная страница").toInt(),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit от 1 до 50").toInt()
]

const reviewIdValidator = [param("id").isInt({ min: 1 }).withMessage("Некорректный id отзыва").toInt()]

const replyValidator = [
    ...reviewIdValidator,
    body("text")
        .isString().withMessage("Напишите ответ")
        .trim()
        .isLength({ min: REPLY_MIN, max: REPLY_MAX })
        .withMessage(`Ответ должен быть от ${REPLY_MIN} до ${REPLY_MAX} символов`)
]

module.exports = { getReviewsValidator, reviewIdValidator, replyValidator }

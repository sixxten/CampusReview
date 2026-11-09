const { body } = require("express-validator")

const COMPLAINT_REASONS = ["offensive", "irrelevant", "false_info", "spam", "other"]

const createComplaintValidator = [
    body("reviewId").isInt({ min: 1 }).withMessage("Не указан отзыв").toInt(),
    body("reason").isIn(COMPLAINT_REASONS).withMessage("Выберите причину жалобы"),
    body("comment")
        .optional({ values: "null" })
        .isString().withMessage("Комментарий должен быть текстом")
        .trim()
        .isLength({ max: 500 }).withMessage("Комментарий не длиннее 500 символов"),
    body("comment")
        .if(body("reason").equals("other"))
        .notEmpty().withMessage("Опишите, что не так с отзывом")
]

module.exports = { createComplaintValidator }

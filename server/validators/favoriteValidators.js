const { param } = require("express-validator")

const courseIdValidator = [param("courseId").isInt({ min: 1 }).withMessage("Некорректный id курса").toInt()]

module.exports = { courseIdValidator }

const { body } = require("express-validator")

const email = body("email")
    .trim()
    .toLowerCase()
    .isEmail().withMessage("Некорректный email")

const registrationValidator = [
    email,
    body("password")
        .isLength({ min: 8, max: 64 }).withMessage("Пароль должен быть от 8 до 64 символов"),
    body("firstName")
        .trim()
        .notEmpty().withMessage("Укажите имя")
        .isLength({ max: 50 }).withMessage("Имя не длиннее 50 символов"),
    body("lastName")
        .trim()
        .notEmpty().withMessage("Укажите фамилию")
        .isLength({ max: 50 }).withMessage("Фамилия не длиннее 50 символов"),
    body("role")
        .optional()
        .isIn(["student", "teacher"]).withMessage("Роль может быть только student или teacher")
]

const loginValidator = [
    email,
    body("password").notEmpty().withMessage("Введите пароль")
]

module.exports = { registrationValidator, loginValidator }

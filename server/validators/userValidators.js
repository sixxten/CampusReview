const { body } = require("express-validator")

const email = body("email")
    .trim()
    .toLowerCase()
    .isEmail().withMessage("Некорректный email")

const firstName = body("firstName")
    .trim()
    .notEmpty().withMessage("Укажите имя")
    .isLength({ max: 50 }).withMessage("Имя не длиннее 50 символов")

const lastName = body("lastName")
    .trim()
    .notEmpty().withMessage("Укажите фамилию")
    .isLength({ max: 50 }).withMessage("Фамилия не длиннее 50 символов")

const strongPassword = (field) =>
    body(field).isLength({ min: 8, max: 64 }).withMessage("Пароль должен быть от 8 до 64 символов")

const registrationValidator = [
    email,
    strongPassword("password"),
    firstName,
    lastName,
    body("role")
        .optional()
        .isIn(["student", "teacher"]).withMessage("Роль может быть только student или teacher")
]

const loginValidator = [
    email,
    body("password").notEmpty().withMessage("Введите пароль")
]

const updateProfileValidator = [firstName, lastName]

const changePasswordValidator = [
    body("currentPassword").notEmpty().withMessage("Введите текущий пароль"),
    strongPassword("newPassword")
]

module.exports = {
    registrationValidator,
    loginValidator,
    updateProfileValidator,
    changePasswordValidator
}

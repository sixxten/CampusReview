const { body, param, query } = require("express-validator")

const COURSE_FORMATS = ["lectures", "seminars", "projects"]

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

const courseIdValidator = [param("id").isInt({ min: 1 }).withMessage("Некорректный id курса").toInt()]

const courseBodyValidator = [
    body("title")
        .isString().withMessage("Введите название")
        .trim()
        .isLength({ min: 3, max: 150 }).withMessage("Название — от 3 до 150 символов"),
    body("description")
        .isString().withMessage("Опишите курс")
        .trim()
        .isLength({ min: 30, max: 3000 }).withMessage("Описание — от 30 до 3000 символов"),
    body("program")
        .optional({ values: "falsy" })
        .isString().withMessage("Программа должна быть текстом")
        .trim()
        .isLength({ max: 5000 }).withMessage("Программа — не длиннее 5000 символов"),
    body("hours").isInt({ min: 1, max: 1000 }).withMessage("Часы — целое число от 1 до 1000").toInt(),
    body("formats").isArray({ min: 1 }).withMessage("Выберите хотя бы один формат"),
    body("formats.*").isIn(COURSE_FORMATS).withMessage("Неизвестный формат курса"),
    body("facultyId").isInt({ min: 1 }).withMessage("Выберите факультет").toInt(),
    body("semesterId").isInt({ min: 1 }).withMessage("Выберите семестр").toInt(),
    body("submit").optional().isBoolean().withMessage("submit: true или false").toBoolean()
]

const createCourseValidator = courseBodyValidator

const updateCourseValidator = [...courseIdValidator, ...courseBodyValidator]

module.exports = {
    getReviewsValidator,
    reviewIdValidator,
    replyValidator,
    courseIdValidator,
    createCourseValidator,
    updateCourseValidator
}

const { validationResult } = require("express-validator")
const ApiError = require("../exceptions/ApiError")

module.exports = function validate(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Ошибка валидации", errors.array()))
    }
    next()
}

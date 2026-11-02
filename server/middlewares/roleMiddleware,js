const ApiError = require("../exceptions/ApiError")

module.exports = function (...roles) {
    return function (req, res, next) {
        if (!req.user) {
            return next(ApiError.Unauthorized())
        }
        if (!roles.includes(req.user.role)) {
            return next(ApiError.Forbidden())
        }
        next()
    }
}

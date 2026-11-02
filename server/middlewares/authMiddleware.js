const ApiError = require("../exceptions/ApiError")
const tokenService = require("../services/tokenService")

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(ApiError.Unauthorized())
    }

    const userData = tokenService.validateAccessToken(authHeader.split(" ")[1])
    if (!userData) {
        return next(ApiError.Unauthorized())
    }

    req.user = userData
    next()
}

class ApiError extends Error {
    constructor(status, message, errors = []) {
        super(message)
        this.status = status
        this.errors = errors
    }

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors)
    }

    static Unauthorized() {
        return new ApiError(401, "Пользователь не авторизован")
    }

    static Forbidden(message = "Нет доступа") {
        return new ApiError(403, message)
    }

    static NotFound(message = "Не найдено") {
        return new ApiError(404, message)
    }
}

module.exports = ApiError

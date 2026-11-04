const userService = require("../services/userService")

const REFRESH_COOKIE = "refreshToken"
const isProduction = process.env.NODE_ENV === "production"

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/api/user"
}


function sendAuthResponse(res, userData, status = 200) {
    res.cookie(REFRESH_COOKIE, userData.refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000
    })
    return res.status(status).json({
        accessToken: userData.accessToken,
        user: userData.user
    })
}

class UserController {
    async registration(req, res, next) {
        try {
            const { email, password, firstName, lastName, role } = req.body
            const userData = await userService.registration({ email, password, firstName, lastName, role })
            return sendAuthResponse(res, userData, 201)
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body
            const userData = await userService.login({ email, password })
            return sendAuthResponse(res, userData)
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            await userService.logout(req.cookies[REFRESH_COOKIE])
            res.clearCookie(REFRESH_COOKIE, cookieOptions)
            return res.json({ message: "Вы вышли из аккаунта" })
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const userData = await userService.refresh(req.cookies[REFRESH_COOKIE])
            return sendAuthResponse(res, userData)
        } catch (e) {
            res.clearCookie(REFRESH_COOKIE, cookieOptions)
            next(e)
        }
    }

    async me(req, res, next) {
        try {
            const user = await userService.getById(req.user.id)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { firstName, lastName } = req.body
            const user = await userService.updateProfile(req.user.id, { firstName, lastName })
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }

    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body
            await userService.changePassword(
                req.user.id,
                { currentPassword, newPassword },
                req.cookies[REFRESH_COOKIE]
            )
            return res.json({ message: "Пароль изменён" })
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()

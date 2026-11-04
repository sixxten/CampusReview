const bcrypt = require("bcryptjs")
const { Op } = require("sequelize")
const { User, Token } = require("../models")
const tokenService = require("./tokenService")
const ApiError = require("../exceptions/ApiError")

const SELF_REGISTER_ROLES = ["student", "teacher"]

function toUserData(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status
    }
}

class UserService {
    async issueTokens(user) {
        const userData = toUserData(user)
        const tokens = tokenService.generateTokens(userData)
        await tokenService.saveToken(userData.id, tokens.refreshToken)
        return { ...tokens, user: userData }
    }

    async registration({ email, password, firstName, lastName, role = "student" }) {
        if (!SELF_REGISTER_ROLES.includes(role)) {
            throw ApiError.BadRequest("Недопустимая роль")
        }

        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            throw ApiError.BadRequest("Пользователь с таким email уже существует")
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            email,
            password: hashPassword,
            firstName,
            lastName,
            role,
            status: role === "teacher" ? "pending" : "active"
        })

        return this.issueTokens(user)
    }

    async login({ email, password }) {
        const user = await User.findOne({ where: { email } })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw ApiError.BadRequest("Неверный email или пароль")
        }
        if (user.status === "blocked") {
            throw ApiError.Forbidden("Аккаунт заблокирован")
        }

        return this.issueTokens(user)
    }

    async logout(refreshToken) {
        if (!refreshToken) return
        await tokenService.removeToken(refreshToken)
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.Unauthorized()
        }

        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            throw ApiError.Unauthorized()
        }

        const user = await User.findByPk(userData.id)
        if (!user) {
            throw ApiError.Unauthorized()
        }
        if (user.status === "blocked") {
            await tokenService.removeToken(refreshToken)
            throw ApiError.Forbidden("Аккаунт заблокирован")
        }

        await tokenService.removeToken(refreshToken)
        return this.issueTokens(user)
    }

    async findUserOrFail(id) {
        const user = await User.findByPk(id)
        if (!user) {
            throw ApiError.NotFound("Пользователь не найден")
        }
        return user
    }

    async getById(id) {
        const user = await this.findUserOrFail(id)
        return toUserData(user)
    }

    async updateProfile(id, { firstName, lastName }) {
        const user = await this.findUserOrFail(id)
        await user.update({ firstName, lastName })
        return toUserData(user)
    }

    async changePassword(id, { currentPassword, newPassword }, currentRefreshToken) {
        const user = await this.findUserOrFail(id)

        if (!(await bcrypt.compare(currentPassword, user.password))) {
            throw ApiError.BadRequest("Неверный текущий пароль", [
                { path: "currentPassword", msg: "Неверный текущий пароль" }
            ])
        }
        if (await bcrypt.compare(newPassword, user.password)) {
            throw ApiError.BadRequest("Новый пароль совпадает с текущим", [
                { path: "newPassword", msg: "Новый пароль совпадает с текущим" }
            ])
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        await Token.destroy({
            where: { userId: id, refreshToken: { [Op.ne]: currentRefreshToken || "" } }
        })
    }
}

module.exports = new UserService()
module.exports.toUserData = toUserData

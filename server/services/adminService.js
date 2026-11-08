const { Op } = require("sequelize")
const { User, Token, Review } = require("../models")
const ApiError = require("../exceptions/ApiError")
const { toUserData } = require("./userService")

class AdminService {
    async getStats() {
        const [pendingReviews, pendingTeachers] = await Promise.all([
            Review.count({ where: { status: "pending" } }),
            User.count({ where: { status: "pending" } })
        ])
        return { pendingReviews, pendingTeachers }
    }

    async getUsers({ search, role, status, page = 1, limit = 20 }) {
        const where = {}
        if (role) where.role = role
        if (status) where.status = status
        if (search) {
            const pattern = `%${search}%`
            where[Op.or] = [
                { email: { [Op.iLike]: pattern } },
                { firstName: { [Op.iLike]: pattern } },
                { lastName: { [Op.iLike]: pattern } }
            ]
        }

        const { rows, count } = await User.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit,
            offset: (page - 1) * limit
        })

        const pendingCount = await User.count({ where: { status: "pending" } })

        return {
            users: rows.map((user) => ({ ...toUserData(user), createdAt: user.createdAt })),
            total: count,
            page,
            pages: Math.max(1, Math.ceil(count / limit)),
            pendingCount
        }
    }

    async updateStatus(adminId, userId, status) {
        if (adminId === userId) {
            throw ApiError.BadRequest("Нельзя изменить собственный статус")
        }

        const user = await User.findByPk(userId)
        if (!user) {
            throw ApiError.NotFound("Пользователь не найден")
        }
        if (user.role === "admin") {
            throw ApiError.Forbidden("Нельзя изменить статус администратора")
        }

        await user.update({ status })

        if (status === "blocked") {
            await Token.destroy({ where: { userId } })
        }

        return { ...toUserData(user), createdAt: user.createdAt }
    }
}

module.exports = new AdminService()

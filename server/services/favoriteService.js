const { Favorite, Course, Faculty, Semester, User } = require("../models")
const ApiError = require("../exceptions/ApiError")

const COURSE_INCLUDE = [
    { model: Faculty, attributes: ["id", "name", "shortName"] },
    { model: Semester, attributes: ["id", "name", "year", "season"] },
    { model: User, as: "teacher", attributes: ["id", "firstName", "lastName"] }
]

class FavoriteService {
    async getMy(userId) {
        const favorites = await Favorite.findAll({
            where: { userId },
            include: [
                {
                    model: Course,
                    where: { status: "published" },
                    attributes: { exclude: ["program", "rejectionReason"] },
                    include: COURSE_INCLUDE
                }
            ],
            order: [["createdAt", "DESC"]]
        })
        return favorites.map((favorite) => favorite.course)
    }

    async getIds(userId) {
        const rows = await Favorite.findAll({ where: { userId }, attributes: ["courseId"], raw: true })
        return rows.map((row) => row.courseId)
    }

    async add(userId, courseId) {
        const course = await Course.findOne({ where: { id: courseId, status: "published" }, attributes: ["id"] })
        if (!course) {
            throw ApiError.NotFound("Курс не найден")
        }
        await Favorite.findOrCreate({ where: { userId, courseId } })
    }

    async remove(userId, courseId) {
        await Favorite.destroy({ where: { userId, courseId } })
    }
}

module.exports = new FavoriteService()

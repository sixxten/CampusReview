const { Op } = require("sequelize")
const { Review, Course, Faculty, Semester, User, ReviewReply } = require("../models")
const ApiError = require("../exceptions/ApiError")
const notificationService = require("./notificationService")
const { toPublicReview, replyInclude } = require("./reviewService")

const round1 = (value) => Math.round(value * 10) / 10

class TeacherService {
    async assertCanReply(userId) {
        const user = await User.findByPk(userId)
        if (!user || user.role !== "teacher") {
            throw ApiError.Forbidden("Отвечать на отзывы могут только преподаватели")
        }
        if (user.status === "pending") {
            throw ApiError.Forbidden("Отвечать на отзывы можно после подтверждения аккаунта")
        }
        if (user.status !== "active") {
            throw ApiError.Forbidden("Аккаунт заблокирован")
        }
    }

    async getCourses(teacherId) {
        const courses = await Course.findAll({
            where: { teacherId },
            include: [
                { model: Faculty, attributes: ["id", "name", "shortName"] },
                { model: Semester, attributes: ["id", "name"] }
            ],
            order: [["createdAt", "DESC"]]
        })

        const reviews = await Review.findAll({
            where: { courseId: courses.map((course) => course.id), status: "published" },
            attributes: ["id", "courseId", "rating"],
            include: [{ model: ReviewReply, as: "reply", attributes: ["id"] }]
        })

        const items = courses.map((course) => {
            const own = reviews.filter((review) => review.courseId === course.id)
            return {
                ...course.get({ plain: true }),
                unansweredCount: own.filter((review) => !review.reply).length
            }
        })

        const rated = reviews.filter((review) => review.rating != null)
        const summary = {
            courses: courses.length,
            published: courses.filter((course) => course.status === "published").length,
            reviews: reviews.length,
            unanswered: reviews.filter((review) => !review.reply).length,
            rating: rated.length ? round1(rated.reduce((sum, review) => sum + review.rating, 0) / rated.length) : 0
        }

        return { courses: items, summary }
    }

    async getReviews(teacherId, { courseId, replied, page = 1, limit = 10 }) {
        const where = { status: "published" }
        if (courseId) where.courseId = courseId
        if (replied === "yes") where["$reply.id$"] = { [Op.ne]: null }
        if (replied === "no") where["$reply.id$"] = null

        const { rows, count } = await Review.findAndCountAll({
            where,
            include: [
                { model: Course, where: { teacherId }, attributes: ["id", "title"] },
                { model: User, as: "author", attributes: ["id", "firstName", "lastName"] },
                { model: Semester, attributes: ["id", "name"] },
                replyInclude
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset: (page - 1) * limit,
            subQuery: false,
            distinct: true
        })

        return {
            reviews: rows.map(toPublicReview),
            total: count,
            page,
            pages: Math.max(1, Math.ceil(count / limit))
        }
    }

    async findOwnReview(teacherId, reviewId) {
        const review = await Review.findOne({
            where: { id: reviewId, status: "published" },
            include: [{ model: Course, attributes: ["id", "title", "teacherId"] }]
        })
        if (!review || review.course.teacherId !== teacherId) {
            throw ApiError.NotFound("Отзыв не найден")
        }
        return review
    }

    async saveReply(teacherId, reviewId, text) {
        await this.assertCanReply(teacherId)
        const review = await this.findOwnReview(teacherId, reviewId)

        const existing = await ReviewReply.findOne({ where: { reviewId } })
        if (existing) {
            await existing.update({ text })
        } else {
            await ReviewReply.create({ reviewId, userId: teacherId, text })
            await notificationService.reviewReplied(review, review.course)
        }

        return ReviewReply.findOne({
            where: { reviewId },
            attributes: replyInclude.attributes,
            include: replyInclude.include
        })
    }

    async removeReply(teacherId, reviewId) {
        await this.assertCanReply(teacherId)
        await this.findOwnReview(teacherId, reviewId)
        const deleted = await ReviewReply.destroy({ where: { reviewId } })
        if (!deleted) {
            throw ApiError.NotFound("Ответ не найден")
        }
    }
}

module.exports = new TeacherService()

const { Complaint, Review, Course, Semester, User } = require("../models")
const ApiError = require("../exceptions/ApiError")
const reviewService = require("./reviewService")
const notificationService = require("./notificationService")

const REASON_TEXT = {
    offensive: "оскорбления или переход на личности",
    irrelevant: "отзыв не относится к курсу",
    false_info: "недостоверная информация",
    spam: "реклама или спам",
    other: "нарушение правил площадки"
}

class ComplaintService {
    async create(userId, { reviewId, reason, comment }) {
        const user = await User.findByPk(userId)
        if (!user || user.status !== "active") {
            throw ApiError.Forbidden("Жаловаться могут только активные пользователи")
        }

        const review = await Review.findOne({ where: { id: reviewId, status: "published" } })
        if (!review) {
            throw ApiError.NotFound("Отзыв не найден")
        }
        if (review.userId === userId) {
            throw ApiError.BadRequest("Нельзя пожаловаться на свой отзыв")
        }

        const existing = await Complaint.findOne({ where: { userId, reviewId } })
        if (existing) {
            throw ApiError.BadRequest("Вы уже пожаловались на этот отзыв")
        }

        return Complaint.create({ userId, reviewId, reason, comment: comment?.trim() || null })
    }

    async getForModeration({ status = "new", page = 1, limit = 10 }) {
        const { rows, count } = await Complaint.findAndCountAll({
            where: { status },
            include: [
                { model: User, as: "author", attributes: ["id", "firstName", "lastName", "email", "role"] },
                {
                    model: Review,
                    include: [
                        { model: Course, attributes: ["id", "title"] },
                        { model: User, as: "author", attributes: ["id", "firstName", "lastName", "email"] },
                        { model: Semester, attributes: ["id", "name"] }
                    ]
                }
            ],
            order: status === "new" ? [["createdAt", "ASC"]] : [["resolvedAt", "DESC"]],
            limit,
            offset: (page - 1) * limit,
            distinct: true
        })

        return { complaints: rows, total: count, page, pages: Math.max(1, Math.ceil(count / limit)) }
    }

    async resolve(adminId, complaintId, status) {
        const complaint = await Complaint.findByPk(complaintId)
        if (!complaint) {
            throw ApiError.NotFound("Жалоба не найдена")
        }
        if (complaint.status !== "new") {
            throw ApiError.BadRequest("Эта жалоба уже рассмотрена")
        }

        const resolution = { status, moderatorId: adminId, resolvedAt: new Date() }

        const review = await Review.findByPk(complaint.reviewId)
        const course = await Course.findByPk(review.courseId, { attributes: ["id", "title"] })

        if (status === "rejected") {
            await complaint.update(resolution)
            await notificationService.complaintResolved(complaint, course, false)
            return complaint
        }

        if (review.status === "published") {
            await review.update({
                status: "rejected",
                rejectionReason: `Скрыт по жалобе: ${REASON_TEXT[complaint.reason]}. Исправьте отзыв и отправьте его на проверку снова.`,
                moderatorId: adminId,
                moderatedAt: new Date()
            })
            await reviewService.recalcCourseRating(review.courseId)
            await notificationService.reviewHidden(review, course)
        }

        const others = await Complaint.findAll({ where: { reviewId: complaint.reviewId, status: "new" } })
        await Complaint.update(resolution, { where: { reviewId: complaint.reviewId, status: "new" } })
        for (const item of others) {
            await notificationService.complaintResolved(item, course, true)
        }
        return complaint.reload()
    }
}

module.exports = new ComplaintService()

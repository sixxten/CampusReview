const { Notification } = require("../models")
const ApiError = require("../exceptions/ApiError")

const courseLink = (courseId) => `/courses/${courseId}`
const reviewFormLink = (courseId) => `/courses/${courseId}/review`

class NotificationService {
    async notify(userId, { type, title, message = null, link = null }) {
        return Notification.create({ userId, type, title, message, link })
    }

    async getMy(userId, { unread, page = 1, limit = 20 } = {}) {
        const where = { userId }
        if (unread) where.isRead = false

        const [{ rows, count }, unreadCount] = await Promise.all([
            Notification.findAndCountAll({
                where,
                order: [["createdAt", "DESC"]],
                limit,
                offset: (page - 1) * limit
            }),
            Notification.count({ where: { userId, isRead: false } })
        ])

        return {
            notifications: rows,
            total: count,
            unreadCount,
            page,
            pages: Math.max(1, Math.ceil(count / limit))
        }
    }

    async getUnreadCount(userId) {
        return Notification.count({ where: { userId, isRead: false } })
    }

    async markRead(userId, id) {
        const notification = await Notification.findOne({ where: { id, userId } })
        if (!notification) {
            throw ApiError.NotFound("Уведомление не найдено")
        }
        await notification.update({ isRead: true })
        return notification
    }

    async markAllRead(userId) {
        await Notification.update({ isRead: true }, { where: { userId, isRead: false } })
    }

    reviewPublished(review, course) {
        return this.notify(review.userId, {
            type: "review_published",
            title: `Ваш отзыв о курсе «${course.title}» опубликован`,
            message: "Спасибо! Теперь его видят все, кто выбирает этот курс.",
            link: courseLink(course.id)
        })
    }

    reviewRejected(review, course) {
        return this.notify(review.userId, {
            type: "review_rejected",
            title: `Отзыв о курсе «${course.title}» отклонён`,
            message: `Причина: ${review.rejectionReason}. Исправьте отзыв и отправьте его снова.`,
            link: reviewFormLink(course.id)
        })
    }

    reviewHidden(review, course) {
        return this.notify(review.userId, {
            type: "review_hidden",
            title: `Отзыв о курсе «${course.title}» скрыт по жалобе`,
            message: review.rejectionReason,
            link: reviewFormLink(course.id)
        })
    }

    complaintResolved(complaint, course, accepted) {
        return this.notify(complaint.userId, {
            type: "complaint_resolved",
            title: "Ваша жалоба рассмотрена",
            message: accepted
                ? `Отзыв о курсе «${course.title}» скрыт. Спасибо, что помогаете поддерживать порядок.`
                : `Администратор проверил отзыв о курсе «${course.title}» и не нашёл нарушений.`,
            link: courseLink(course.id)
        })
    }

    newReviewOnCourse(course) {
        return this.notify(course.teacherId, {
            type: "course_new_review",
            title: `Новый отзыв о вашем курсе «${course.title}»`,
            message: "Студент поделился впечатлениями о курсе.",
            link: courseLink(course.id)
        })
    }

    teacherApproved(userId) {
        return this.notify(userId, {
            type: "teacher_approved",
            title: "Ваш аккаунт преподавателя подтверждён",
            message: "Теперь вам доступны все возможности преподавателя на платформе.",
            link: "/profile"
        })
    }

    accountUnblocked(userId) {
        return this.notify(userId, {
            type: "account_unblocked",
            title: "Ваш аккаунт разблокирован",
            message: "Вы снова можете пользоваться платформой.",
            link: "/profile"
        })
    }
}

module.exports = new NotificationService()

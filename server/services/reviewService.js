const { Op, fn, col } = require("sequelize")
const { Review, Course, Semester, User, SCORE_FIELDS } = require("../models")
const ApiError = require("../exceptions/ApiError")
const notificationService = require("./notificationService")

const TEXT_FIELDS = ["pros", "cons", "advice"]
const EDITABLE_STATUSES = ["draft", "pending", "rejected"]
const MIN_TEXT_LENGTH = 20

const round1 = (value) => Math.round(value * 10) / 10

function calcRating({ usefulness, atmosphere, practicalValue }) {
    if ([usefulness, atmosphere, practicalValue].some((value) => value == null)) return null
    return round1((usefulness + atmosphere + practicalValue) / 3)
}

function pickFields(data) {
    const fields = { semesterId: data.semesterId ?? null, isAnonymous: Boolean(data.isAnonymous) }
    for (const name of SCORE_FIELDS) fields[name] = data[name] ?? null
    for (const name of TEXT_FIELDS) fields[name] = data[name] ? data[name].trim() || null : null
    return fields
}

function assertComplete(fields) {
    const errors = []
    if (!fields.semesterId) errors.push({ path: "semesterId", msg: "Укажите, в каком семестре проходили курс" })
    for (const name of SCORE_FIELDS) {
        if (fields[name] == null) errors.push({ path: name, msg: "Поставьте оценку" })
    }
    const textLength = TEXT_FIELDS.reduce((sum, name) => sum + (fields[name]?.length || 0), 0)
    if (textLength < MIN_TEXT_LENGTH) {
        errors.push({ path: "texts", msg: "Напишите хотя бы пару предложений о курсе" })
    }
    if (errors.length) {
        throw ApiError.BadRequest("Заполните анкету полностью", errors)
    }
}

function toPublicReview(review) {
    const data = review.get({ plain: true })
    return {
        id: data.id,
        rating: data.rating,
        ...Object.fromEntries(SCORE_FIELDS.map((name) => [name, data[name]])),
        pros: data.pros,
        cons: data.cons,
        advice: data.advice,
        semester: data.semester,
        author: data.isAnonymous ? null : data.author,
        createdAt: data.createdAt
    }
}

class ReviewService {
    async assertActiveStudent(userId) {
        const user = await User.findByPk(userId)
        if (!user || user.role !== "student") {
            throw ApiError.Forbidden("Отзывы могут оставлять только студенты")
        }
        if (user.status !== "active") {
            throw ApiError.Forbidden("Аккаунт заблокирован")
        }
    }

    async assertSemesterExists(semesterId) {
        if (semesterId && !(await Semester.findByPk(semesterId))) {
            throw ApiError.BadRequest("Семестр не найден", [{ path: "semesterId", msg: "Семестр не найден" }])
        }
    }

    async create(userId, data, submit) {
        await this.assertActiveStudent(userId)

        const course = await Course.findOne({ where: { id: data.courseId, status: "published" } })
        if (!course) {
            throw ApiError.NotFound("Курс не найден")
        }
        const existing = await Review.findOne({ where: { userId, courseId: course.id } })
        if (existing) {
            throw ApiError.BadRequest("Вы уже оставили отзыв на этот курс — его можно изменить в личном кабинете")
        }

        const fields = pickFields(data)
        await this.assertSemesterExists(fields.semesterId)
        if (submit) assertComplete(fields)

        return Review.create({
            ...fields,
            userId,
            courseId: course.id,
            rating: calcRating(fields),
            status: submit ? "pending" : "draft"
        })
    }

    async update(userId, reviewId, data, submit) {
        await this.assertActiveStudent(userId)

        const review = await Review.findOne({ where: { id: reviewId, userId } })
        if (!review) {
            throw ApiError.NotFound("Отзыв не найден")
        }
        if (!EDITABLE_STATUSES.includes(review.status)) {
            throw ApiError.BadRequest("Опубликованный отзыв нельзя изменить, можно только удалить")
        }

        const fields = pickFields(data)
        await this.assertSemesterExists(fields.semesterId)
        if (submit) assertComplete(fields)

        await review.update({
            ...fields,
            rating: calcRating(fields),
            status: submit ? "pending" : "draft",
            rejectionReason: null
        })
        return review
    }

    async remove(userId, reviewId) {
        const review = await Review.findOne({ where: { id: reviewId, userId } })
        if (!review) {
            throw ApiError.NotFound("Отзыв не найден")
        }
        const wasPublished = review.status === "published"
        const { courseId } = review
        await review.destroy()
        if (wasPublished) await this.recalcCourseRating(courseId)
    }

    async getMy(userId, { status, courseId } = {}) {
        const where = { userId }
        if (status) where.status = status
        if (courseId) where.courseId = courseId

        return Review.findAll({
            where,
            include: [
                { model: Course, attributes: ["id", "title"] },
                { model: Semester, attributes: ["id", "name"] }
            ],
            order: [["updatedAt", "DESC"]]
        })
    }

    async assertCoursePublished(courseId) {
        const course = await Course.findOne({ where: { id: courseId, status: "published" }, attributes: ["id"] })
        if (!course) {
            throw ApiError.NotFound("Курс не найден")
        }
    }

    async getCourseReviews(courseId, { semesterId, rating, withText, sort = "new", page = 1, limit = 10 }) {
        await this.assertCoursePublished(courseId)

        const where = { courseId, status: "published" }
        if (semesterId) where.semesterId = semesterId
        if (rating) where.rating = { [Op.gte]: rating - 0.5, [Op.lt]: rating + 0.5 }
        if (withText) {
            where[Op.or] = TEXT_FIELDS.map((name) => ({ [name]: { [Op.ne]: null } }))
        }

        const order = {
            new: [["createdAt", "DESC"]],
            high: [["rating", "DESC"], ["createdAt", "DESC"]],
            low: [["rating", "ASC"], ["createdAt", "DESC"]]
        }[sort]

        const { rows, count } = await Review.findAndCountAll({
            where,
            include: [
                { model: User, as: "author", attributes: ["id", "firstName", "lastName"] },
                { model: Semester, attributes: ["id", "name"] }
            ],
            order,
            limit,
            offset: (page - 1) * limit
        })

        return {
            reviews: rows.map(toPublicReview),
            total: count,
            page,
            pages: Math.max(1, Math.ceil(count / limit))
        }
    }

    async getCourseStats(courseId) {
        await this.assertCoursePublished(courseId)

        const reviews = await Review.findAll({
            where: { courseId, status: "published" },
            attributes: [...SCORE_FIELDS, "rating"],
            raw: true
        })

        const count = reviews.length
        const averages = {}
        for (const name of SCORE_FIELDS) {
            averages[name] = count ? round1(reviews.reduce((sum, review) => sum + review[name], 0) / count) : 0
        }

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        for (const review of reviews) {
            const bucket = Math.min(5, Math.max(1, Math.round(review.rating)))
            distribution[bucket] += 1
        }

        const rating = count ? round1(reviews.reduce((sum, review) => sum + review.rating, 0) / count) : 0
        return { count, rating, averages, distribution }
    }

    async getForModeration({ status = "pending", search, page = 1, limit = 10 }) {
        const where = { status }
        if (search) {
            const pattern = `%${search}%`
            where[Op.or] = [
                { "$course.title$": { [Op.iLike]: pattern } },
                { "$author.firstName$": { [Op.iLike]: pattern } },
                { "$author.lastName$": { [Op.iLike]: pattern } }
            ]
        }

        const { rows, count } = await Review.findAndCountAll({
            where,
            include: [
                { model: Course, attributes: ["id", "title"] },
                { model: User, as: "author", attributes: ["id", "firstName", "lastName", "email"] },
                { model: Semester, attributes: ["id", "name"] }
            ],
            order: status === "pending" ? [["updatedAt", "ASC"]] : [["moderatedAt", "DESC"]],
            limit,
            offset: (page - 1) * limit,
            subQuery: false,
            distinct: true
        })

        return {
            reviews: rows,
            total: count,
            page,
            pages: Math.max(1, Math.ceil(count / limit))
        }
    }

    async moderate(adminId, reviewId, { status, rejectionReason }) {
        const review = await Review.findByPk(reviewId)
        if (!review) {
            throw ApiError.NotFound("Отзыв не найден")
        }
        if (review.status !== "pending") {
            throw ApiError.BadRequest("Этот отзыв уже проверен или ещё не отправлен на модерацию")
        }

        await review.update({
            status,
            rejectionReason: status === "rejected" ? rejectionReason : null,
            moderatorId: adminId,
            moderatedAt: new Date()
        })

        const course = await Course.findByPk(review.courseId, { attributes: ["id", "title", "teacherId"] })
        if (status === "published") {
            await this.recalcCourseRating(review.courseId)
            await notificationService.reviewPublished(review, course)
            await notificationService.newReviewOnCourse(course)
        } else {
            await notificationService.reviewRejected(review, course)
        }
        return review
    }

    async recalcCourseRating(courseId) {
        const stats = await Review.findOne({
            where: { courseId, status: "published" },
            attributes: [
                [fn("AVG", col("rating")), "avgRating"],
                [fn("AVG", col("difficulty")), "avgDifficulty"],
                [fn("COUNT", col("id")), "reviewsCount"]
            ],
            raw: true
        })

        await Course.update(
            {
                avgRating: round1(Number(stats.avgRating) || 0),
                avgDifficulty: round1(Number(stats.avgDifficulty) || 0),
                reviewsCount: Number(stats.reviewsCount) || 0
            },
            { where: { id: courseId } }
        )
    }
}

module.exports = new ReviewService()

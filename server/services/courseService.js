const { Op } = require("sequelize")
const sequelize = require("../db")
const { Course, Faculty, Semester, User } = require("../models")
const ApiError = require("../exceptions/ApiError")
const notificationService = require("./notificationService")

const DIFFICULTY_RANGES = {
    low: { [Op.gt]: 0, [Op.lt]: 2.5 },
    medium: { [Op.gte]: 2.5, [Op.lt]: 3.7 },
    high: { [Op.gte]: 3.7 }
}

const noReviewsLast = [sequelize.literal('"course"."reviewsCount" = 0'), "ASC"]

const SORTS = {
    rating: [["avgRating", "DESC"], ["reviewsCount", "DESC"], ["title", "ASC"]],
    reviews: [["reviewsCount", "DESC"], ["title", "ASC"]],
    easy: [noReviewsLast, ["avgDifficulty", "ASC"], ["title", "ASC"]],
    hard: [noReviewsLast, ["avgDifficulty", "DESC"], ["title", "ASC"]],
    title: [["title", "ASC"]]
}

const INCLUDE = [
    { model: Faculty, attributes: ["id", "name", "shortName"] },
    { model: Semester, attributes: ["id", "name", "year", "season"] },
    { model: User, as: "teacher", attributes: ["id", "firstName", "lastName"] }
]

class CourseService {
    async getCourses({ search, facultyId, semesterId, formats, minRating, difficulty, sort = "rating", page = 1, limit = 12 }) {
        const where = { status: "published" }

        if (search) {
            const pattern = `%${search}%`
            where[Op.or] = [
                { title: { [Op.iLike]: pattern } },
                { "$teacher.firstName$": { [Op.iLike]: pattern } },
                { "$teacher.lastName$": { [Op.iLike]: pattern } }
            ]
        }
        if (facultyId) where.facultyId = facultyId
        if (semesterId) where.semesterId = semesterId
        if (formats && formats.length) where.formats = { [Op.contains]: formats }
        if (minRating) where.avgRating = { [Op.gte]: minRating }
        if (difficulty) {
            where.avgDifficulty = DIFFICULTY_RANGES[difficulty]
            where.reviewsCount = { [Op.gt]: 0 }
        }

        const { rows, count } = await Course.findAndCountAll({
            where,
            include: INCLUDE,
            attributes: { exclude: ["program", "rejectionReason"] },
            order: SORTS[sort],
            limit,
            offset: (page - 1) * limit,
            subQuery: false,
            distinct: true
        })

        return {
            courses: rows,
            total: count,
            page,
            pages: Math.max(1, Math.ceil(count / limit))
        }
    }

    async getById(id) {
        const course = await Course.findOne({
            where: { id, status: "published" },
            include: INCLUDE,
            attributes: { exclude: ["rejectionReason"] }
        })
        if (!course) {
            throw ApiError.NotFound("Курс не найден")
        }
        return course
    }

    async getFilterOptions() {
        const [faculties, semesters] = await Promise.all([
            Faculty.findAll({ attributes: ["id", "name", "shortName"], order: [["name", "ASC"]] }),
            Semester.findAll({ attributes: ["id", "name", "year", "season"], order: [["year", "DESC"], ["season", "ASC"]] })
        ])
        return { faculties, semesters }
    }

    async getForModeration({ status = "pending", search, page = 1, limit = 10 }) {
        const where = { status }
        if (search) {
            const pattern = `%${search}%`
            where[Op.or] = [
                { title: { [Op.iLike]: pattern } },
                { "$teacher.firstName$": { [Op.iLike]: pattern } },
                { "$teacher.lastName$": { [Op.iLike]: pattern } }
            ]
        }

        const { rows, count } = await Course.findAndCountAll({
            where,
            include: [
                { model: Faculty, attributes: ["id", "name", "shortName"] },
                { model: Semester, attributes: ["id", "name"] },
                { model: User, as: "teacher", attributes: ["id", "firstName", "lastName", "email"] }
            ],
            order: status === "pending" ? [["updatedAt", "ASC"]] : [["moderatedAt", "DESC NULLS LAST"], ["updatedAt", "DESC"]],
            limit,
            offset: (page - 1) * limit,
            subQuery: false,
            distinct: true
        })

        return { courses: rows, total: count, page, pages: Math.max(1, Math.ceil(count / limit)) }
    }

    async moderate(courseId, { status, rejectionReason }) {
        const course = await Course.findByPk(courseId)
        if (!course) {
            throw ApiError.NotFound("Курс не найден")
        }
        if (course.status !== "pending") {
            throw ApiError.BadRequest("Этот курс уже проверен или ещё не отправлен на модерацию")
        }

        await course.update({
            status,
            rejectionReason: status === "rejected" ? rejectionReason : null,
            moderatedAt: new Date()
        })

        if (status === "published") {
            await notificationService.coursePublished(course)
        } else {
            await notificationService.courseRejected(course)
        }
        return course
    }
}

module.exports = new CourseService()

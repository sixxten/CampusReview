const { matchedData } = require("express-validator")
const teacherService = require("../services/teacherService")

class TeacherController {
    async getCourses(req, res, next) {
        try {
            return res.json(await teacherService.getCourses(req.user.id))
        } catch (e) {
            next(e)
        }
    }

    async getCourse(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            return res.json(await teacherService.getCourse(req.user.id, id))
        } catch (e) {
            next(e)
        }
    }

    async createCourse(req, res, next) {
        try {
            const { submit, ...data } = matchedData(req, { locations: ["body"] })
            const course = await teacherService.createCourse(req.user.id, data, Boolean(submit))
            return res.status(201).json(course)
        } catch (e) {
            next(e)
        }
    }

    async updateCourse(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            const { submit, ...data } = matchedData(req, { locations: ["body"] })
            return res.json(await teacherService.updateCourse(req.user.id, id, data, Boolean(submit)))
        } catch (e) {
            next(e)
        }
    }

    async removeCourse(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            await teacherService.removeCourse(req.user.id, id)
            return res.json({ message: "Курс удалён" })
        } catch (e) {
            next(e)
        }
    }

    async getReviews(req, res, next) {
        try {
            const filters = matchedData(req, { locations: ["query"] })
            return res.json(await teacherService.getReviews(req.user.id, filters))
        } catch (e) {
            next(e)
        }
    }

    async saveReply(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            const { text } = matchedData(req, { locations: ["body"] })
            return res.json(await teacherService.saveReply(req.user.id, id, text))
        } catch (e) {
            next(e)
        }
    }

    async removeReply(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            await teacherService.removeReply(req.user.id, id)
            return res.json({ message: "Ответ удалён" })
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new TeacherController()

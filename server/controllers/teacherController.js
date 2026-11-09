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

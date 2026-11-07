const { matchedData } = require("express-validator")
const courseService = require("../services/courseService")

class CourseController {
    async getCourses(req, res, next) {
        try {
            const filters = matchedData(req, { locations: ["query"] })
            const result = await courseService.getCourses(filters)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }

    async getCourse(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            const course = await courseService.getById(id)
            return res.json(course)
        } catch (e) {
            next(e)
        }
    }

    async getFilterOptions(req, res, next) {
        try {
            const options = await courseService.getFilterOptions()
            return res.json(options)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new CourseController()

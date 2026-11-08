const { matchedData } = require("express-validator")
const adminService = require("../services/adminService")
const reviewService = require("../services/reviewService")

class AdminController {
    async getStats(req, res, next) {
        try {
            return res.json(await adminService.getStats())
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            const filters = matchedData(req, { locations: ["query"] })
            return res.json(await adminService.getUsers(filters))
        } catch (e) {
            next(e)
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            const { status } = matchedData(req, { locations: ["body"] })
            return res.json(await adminService.updateStatus(req.user.id, id, status))
        } catch (e) {
            next(e)
        }
    }

    async getReviews(req, res, next) {
        try {
            const filters = matchedData(req, { locations: ["query"] })
            return res.json(await reviewService.getForModeration(filters))
        } catch (e) {
            next(e)
        }
    }

    async moderateReview(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            const decision = matchedData(req, { locations: ["body"] })
            return res.json(await reviewService.moderate(req.user.id, id, decision))
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new AdminController()

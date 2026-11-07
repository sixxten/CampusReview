const { matchedData } = require("express-validator")
const reviewService = require("../services/reviewService")

class ReviewController {
    async create(req, res, next) {
        try {
            const { submit, ...data } = matchedData(req, { locations: ["body"] })
            const review = await reviewService.create(req.user.id, data, Boolean(submit))
            return res.status(201).json(review)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            const { submit, ...data } = matchedData(req, { locations: ["body"] })
            const review = await reviewService.update(req.user.id, id, data, Boolean(submit))
            return res.json(review)
        } catch (e) {
            next(e)
        }
    }

    async remove(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            await reviewService.remove(req.user.id, id)
            return res.json({ message: "Отзыв удалён" })
        } catch (e) {
            next(e)
        }
    }

    async getMy(req, res, next) {
        try {
            const filters = matchedData(req, { locations: ["query"] })
            const reviews = await reviewService.getMy(req.user.id, filters)
            return res.json(reviews)
        } catch (e) {
            next(e)
        }
    }

    async getCourseReviews(req, res, next) {
        try {
            const { id, ...filters } = matchedData(req, { locations: ["params", "query"] })
            const result = await reviewService.getCourseReviews(id, filters)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }

    async getCourseStats(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            const stats = await reviewService.getCourseStats(id)
            return res.json(stats)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new ReviewController()

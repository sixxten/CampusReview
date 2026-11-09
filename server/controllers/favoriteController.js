const { matchedData } = require("express-validator")
const favoriteService = require("../services/favoriteService")

class FavoriteController {
    async getMy(req, res, next) {
        try {
            return res.json(await favoriteService.getMy(req.user.id))
        } catch (e) {
            next(e)
        }
    }

    async getIds(req, res, next) {
        try {
            return res.json(await favoriteService.getIds(req.user.id))
        } catch (e) {
            next(e)
        }
    }

    async add(req, res, next) {
        try {
            const { courseId } = matchedData(req, { locations: ["params"] })
            await favoriteService.add(req.user.id, courseId)
            return res.status(201).json({ courseId, isFavorite: true })
        } catch (e) {
            next(e)
        }
    }

    async remove(req, res, next) {
        try {
            const { courseId } = matchedData(req, { locations: ["params"] })
            await favoriteService.remove(req.user.id, courseId)
            return res.json({ courseId, isFavorite: false })
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new FavoriteController()

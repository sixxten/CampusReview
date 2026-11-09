const { matchedData } = require("express-validator")
const notificationService = require("../services/notificationService")

class NotificationController {
    async getMy(req, res, next) {
        try {
            const filters = matchedData(req, { locations: ["query"] })
            return res.json(await notificationService.getMy(req.user.id, filters))
        } catch (e) {
            next(e)
        }
    }

    async getUnreadCount(req, res, next) {
        try {
            const count = await notificationService.getUnreadCount(req.user.id)
            return res.json({ count })
        } catch (e) {
            next(e)
        }
    }

    async markRead(req, res, next) {
        try {
            const { id } = matchedData(req, { locations: ["params"] })
            return res.json(await notificationService.markRead(req.user.id, id))
        } catch (e) {
            next(e)
        }
    }

    async markAllRead(req, res, next) {
        try {
            await notificationService.markAllRead(req.user.id)
            return res.json({ success: true })
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new NotificationController()

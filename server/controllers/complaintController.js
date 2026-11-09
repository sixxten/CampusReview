const { matchedData } = require("express-validator")
const complaintService = require("../services/complaintService")

class ComplaintController {
    async create(req, res, next) {
        try {
            const data = matchedData(req, { locations: ["body"] })
            const complaint = await complaintService.create(req.user.id, data)
            return res.status(201).json({ id: complaint.id, message: "Жалоба отправлена" })
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new ComplaintController()

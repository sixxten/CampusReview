const adminService = require("../services/adminService")

class AdminController {
    async getUsers(req, res, next) {
        try {
            const { search, role, status, page, limit } = req.query
            const result = await adminService.getUsers({ search, role, status, page, limit })
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }

    async updateStatus(req, res, next) {
        try {
            const user = await adminService.updateStatus(req.user.id, req.params.id, req.body.status)
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new AdminController()

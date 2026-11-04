const Router = require("express")
const adminController = require("../controllers/adminController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validationMiddleware")
const { getUsersValidator, updateStatusValidator } = require("../validators/adminValidators")

const router = new Router()

router.use(authMiddleware, roleMiddleware("admin"))

router.get("/users", getUsersValidator, validate, adminController.getUsers)
router.patch("/users/:id/status", updateStatusValidator, validate, adminController.updateStatus)

module.exports = router

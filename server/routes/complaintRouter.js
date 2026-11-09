const Router = require("express")
const complaintController = require("../controllers/complaintController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validationMiddleware")
const { createComplaintValidator } = require("../validators/complaintValidators")

const router = new Router()

router.post("/", authMiddleware, roleMiddleware("student", "teacher"), createComplaintValidator, validate, complaintController.create)

module.exports = router

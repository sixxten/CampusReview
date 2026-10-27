const Router = require("express")
const userController = require("../controllers/userController")
const authMiddleware = require("../middlewares/authMiddleware")
const { registrationValidator, loginValidator } = require("../validators/userValidators")

const router = new Router()

router.post("/registration", registrationValidator, userController.registration)
router.post("/login", loginValidator, userController.login)
router.post("/logout", userController.logout)
router.post("/refresh", userController.refresh)
router.get("/me", authMiddleware, userController.me)

module.exports = router

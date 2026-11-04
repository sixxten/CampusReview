const Router = require("express")
const userController = require("../controllers/userController")
const authMiddleware = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validationMiddleware")
const {
    registrationValidator,
    loginValidator,
    updateProfileValidator,
    changePasswordValidator
} = require("../validators/userValidators")

const router = new Router()

router.post("/registration", registrationValidator, validate, userController.registration)
router.post("/login", loginValidator, validate, userController.login)
router.post("/logout", userController.logout)
router.post("/refresh", userController.refresh)

router.get("/me", authMiddleware, userController.me)
router.patch("/me", authMiddleware, updateProfileValidator, validate, userController.updateProfile)
router.patch("/me/password", authMiddleware, changePasswordValidator, validate, userController.changePassword)

module.exports = router
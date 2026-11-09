const Router = require("express")
const favoriteController = require("../controllers/favoriteController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validationMiddleware")
const { courseIdValidator } = require("../validators/favoriteValidators")

const router = new Router()

router.use(authMiddleware, roleMiddleware("student"))

router.get("/", favoriteController.getMy)
router.get("/ids", favoriteController.getIds)
router.post("/:courseId", courseIdValidator, validate, favoriteController.add)
router.delete("/:courseId", courseIdValidator, validate, favoriteController.remove)

module.exports = router

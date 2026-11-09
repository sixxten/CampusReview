const Router = require("express")
const notificationController = require("../controllers/notificationController")
const authMiddleware = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validationMiddleware")
const { getNotificationsValidator, notificationIdValidator } = require("../validators/notificationValidators")

const router = new Router()

router.use(authMiddleware)

router.get("/", getNotificationsValidator, validate, notificationController.getMy)
router.get("/unread-count", notificationController.getUnreadCount)
router.patch("/read-all", notificationController.markAllRead)
router.patch("/:id/read", notificationIdValidator, validate, notificationController.markRead)

module.exports = router

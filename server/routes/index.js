const Router = require("express")
const userRouter = require("./userRouter")
const adminRouter = require("./adminRouter")
const courseRouter = require("./courseRouter")
const reviewRouter = require("./reviewRouter")
const favoriteRouter = require("./favoriteRouter")
const complaintRouter = require("./complaintRouter")
const notificationRouter = require("./notificationRouter")

const router = new Router()

router.use("/user", userRouter)
router.use("/admin", adminRouter)
router.use("/courses", courseRouter)
router.use("/reviews", reviewRouter)
router.use("/favorites", favoriteRouter)
router.use("/complaints", complaintRouter)
router.use("/notifications", notificationRouter)

module.exports = router

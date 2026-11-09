const Router = require("express")
const userRouter = require("./userRouter")
const adminRouter = require("./adminRouter")
const courseRouter = require("./courseRouter")
const reviewRouter = require("./reviewRouter")
const favoriteRouter = require("./favoriteRouter")
const complaintRouter = require("./complaintRouter")

const router = new Router()

router.use("/user", userRouter)
router.use("/admin", adminRouter)
router.use("/courses", courseRouter)
router.use("/reviews", reviewRouter)
router.use("/favorites", favoriteRouter)
router.use("/complaints", complaintRouter)

module.exports = router

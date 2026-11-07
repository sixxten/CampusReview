const Router = require("express")
const userRouter = require("./userRouter")
const adminRouter = require("./adminRouter")
const courseRouter = require("./courseRouter")
const reviewRouter = require("./reviewRouter")

const router = new Router()

router.use("/user", userRouter)
router.use("/admin", adminRouter)
router.use("/courses", courseRouter)
router.use("/reviews", reviewRouter)

module.exports = router

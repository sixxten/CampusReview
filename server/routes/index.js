const Router = require("express")
const userRouter = require("./userRouter")
const adminRouter = require("./adminRouter")
const courseRouter = require("./courseRouter")

const router = new Router()

router.use("/user", userRouter)
router.use("/admin", adminRouter)
router.use("/courses", courseRouter)

module.exports = router

const Router = require("express")
const teacherController = require("../controllers/teacherController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validationMiddleware")
const {
    getReviewsValidator,
    reviewIdValidator,
    replyValidator,
    courseIdValidator,
    createCourseValidator,
    updateCourseValidator
} = require("../validators/teacherValidators")

const router = new Router()

router.use(authMiddleware, roleMiddleware("teacher"))

router.get("/courses", teacherController.getCourses)
router.post("/courses", createCourseValidator, validate, teacherController.createCourse)
router.get("/courses/:id", courseIdValidator, validate, teacherController.getCourse)
router.put("/courses/:id", updateCourseValidator, validate, teacherController.updateCourse)
router.delete("/courses/:id", courseIdValidator, validate, teacherController.removeCourse)
router.get("/reviews", getReviewsValidator, validate, teacherController.getReviews)
router.put("/reviews/:id/reply", replyValidator, validate, teacherController.saveReply)
router.delete("/reviews/:id/reply", reviewIdValidator, validate, teacherController.removeReply)

module.exports = router

const Router = require("express")
const adminController = require("../controllers/adminController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validationMiddleware")
const {
    getUsersValidator,
    updateStatusValidator,
    getReviewsValidator,
    moderateReviewValidator,
    getComplaintsValidator,
    resolveComplaintValidator,
    getCoursesValidator,
    moderateCourseValidator
} = require("../validators/adminValidators")

const router = new Router()

router.use(authMiddleware, roleMiddleware("admin"))

router.get("/stats", adminController.getStats)

router.get("/users", getUsersValidator, validate, adminController.getUsers)
router.patch("/users/:id/status", updateStatusValidator, validate, adminController.updateStatus)

router.get("/reviews", getReviewsValidator, validate, adminController.getReviews)
router.patch("/reviews/:id", moderateReviewValidator, validate, adminController.moderateReview)

router.get("/courses", getCoursesValidator, validate, adminController.getCourses)
router.patch("/courses/:id", moderateCourseValidator, validate, adminController.moderateCourse)

router.get("/complaints", getComplaintsValidator, validate, adminController.getComplaints)
router.patch("/complaints/:id", resolveComplaintValidator, validate, adminController.resolveComplaint)

module.exports = router

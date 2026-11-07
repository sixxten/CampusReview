const Router = require("express")
const courseController = require("../controllers/courseController")
const reviewController = require("../controllers/reviewController")
const validate = require("../middlewares/validationMiddleware")
const { getCoursesValidator, getCourseValidator } = require("../validators/courseValidators")
const { courseReviewsValidator, courseStatsValidator } = require("../validators/reviewValidators")

const router = new Router()

router.get("/", getCoursesValidator, validate, courseController.getCourses)

router.get("/filters", courseController.getFilterOptions)

router.get("/:id", getCourseValidator, validate, courseController.getCourse)

router.get("/:id/reviews", courseReviewsValidator, validate, reviewController.getCourseReviews)
router.get("/:id/stats", courseStatsValidator, validate, reviewController.getCourseStats)

module.exports = router

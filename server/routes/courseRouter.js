const Router = require("express")
const courseController = require("../controllers/courseController")
const validate = require("../middlewares/validationMiddleware")
const { getCoursesValidator, getCourseValidator } = require("../validators/courseValidators")

const router = new Router()

router.get("/", getCoursesValidator, validate, courseController.getCourses)

router.get("/filters", courseController.getFilterOptions)

router.get("/:id", getCourseValidator, validate, courseController.getCourse)

module.exports = router

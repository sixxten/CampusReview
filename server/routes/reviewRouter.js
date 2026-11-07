const Router = require("express")
const reviewController = require("../controllers/reviewController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validationMiddleware")
const {
    createReviewValidator,
    updateReviewValidator,
    reviewIdValidator,
    myReviewsValidator
} = require("../validators/reviewValidators")

const router = new Router()

router.use(authMiddleware, roleMiddleware("student"))

router.get("/my", myReviewsValidator, validate, reviewController.getMy)
router.post("/", createReviewValidator, validate, reviewController.create)
router.put("/:id", updateReviewValidator, validate, reviewController.update)
router.delete("/:id", reviewIdValidator, validate, reviewController.remove)

module.exports = router

const express = require("express")
const config = require("config")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const sequelize = require("./db")
require("./models")
const router = require("./routes/index")
const errorMiddleware = require("./middlewares/errorMiddleware")
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./docs/swagger")

const PORT = config.get("port")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: config.get("clientUrl")
}))

app.get("/api/docs.json", (req, res) => res.json(swaggerSpec))
app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customSiteTitle: "CampusReview API",
        swaggerOptions: { persistAuthorization: true, docExpansion: "none", tagsSorter: "none" }
    })
)

app.use("/api", router)

app.use(errorMiddleware)

async function start() {
    try {
        await sequelize.authenticate()
        await sequelize.sync({ alter: true })
        console.log("Database is working!")
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`)
            console.log(`Swagger: http://localhost:${PORT}/api/docs`)
        })
    } catch (e) {
        console.log("Server error", e.message)
        process.exit(1)
    }
}

if (require.main === module) {
    start()
}

module.exports = { app }

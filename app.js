const express = require("express")



const PORT = 5000

const app = express()



async function start() {
    try {
        app.listen(PORT, () => console.log(`Start on port ${PORT}`))
    } catch(e) {
        console.log("Server error", e.message())
        process.exit(1)
    }

}

start()


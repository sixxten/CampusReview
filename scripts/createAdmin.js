const bcrypt = require("bcryptjs")
const sequelize = require("../db")
const { User } = require("../models")

async function main() {
    const [email, password, firstName = "Админ", lastName = "Системы"] = process.argv.slice(2)
    if (!email || !password) {
        console.log("Использование: npm run create-admin -- <email> <password> [имя] [фамилия]")
        process.exit(1)
    }

    await sequelize.authenticate()
    await sequelize.sync()

    const exists = await User.findOne({ where: { email: email.toLowerCase() } })
    if (exists) {
        console.log("Пользователь с таким email уже есть")
        process.exit(1)
    }

    await User.create({
        email: email.toLowerCase(),
        password: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        role: "admin",
        status: "active"
    })
    console.log(`Администратор ${email} создан`)
    await sequelize.close()
}

main().catch((e) => {
    console.error(e.message)
    process.exit(1)
})

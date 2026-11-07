const bcrypt = require("bcryptjs")
const sequelize = require("../db")
const { User, Faculty, Semester, Course } = require("../models")
const data = require("./seedData")

async function seed() {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })

    const faculties = {}
    for (const { key, ...fields } of data.faculties) {
        const [faculty] = await Faculty.findOrCreate({ where: { name: fields.name }, defaults: fields })
        faculties[key] = faculty
    }

    const semesters = {}
    for (const { key, ...fields } of data.semesters) {
        const [semester] = await Semester.findOrCreate({ where: { name: fields.name }, defaults: fields })
        semesters[key] = semester
    }

    const password = await bcrypt.hash(data.DEMO_PASSWORD, 10)
    const users = {}
    const people = [
        ...data.teachers.map((person) => ({ ...person, role: "teacher" })),
        ...data.students.map((person) => ({ ...person, role: "student" }))
    ]
    for (const { faculty, ...fields } of people) {
        const [user] = await User.findOrCreate({
            where: { email: fields.email },
            defaults: {
                ...fields,
                password,
                status: fields.status || "active",
                facultyId: faculties[faculty].id
            }
        })
        users[fields.email] = user
    }

    for (const { teacher, faculty, semester, ...fields } of data.courses) {
        const teacherId = users[teacher].id
        await Course.findOrCreate({
            where: { title: fields.title, teacherId },
            defaults: {
                ...fields,
                status: fields.status || "published",
                teacherId,
                facultyId: faculties[faculty].id,
                semesterId: semesters[semester].id
            }
        })
    }

    console.log("Готово! Сейчас в базе:")
    console.log(`  факультетов: ${await Faculty.count()}`)
    console.log(`  семестров:   ${await Semester.count()}`)
    console.log(`  пользователей: ${await User.count()}`)
    console.log(`  курсов: ${await Course.count()} (опубликовано: ${await Course.count({ where: { status: "published" } })})`)
    console.log(`Пароль демо-пользователей: ${data.DEMO_PASSWORD}`)
}

seed()
    .catch((e) => {
        console.error("Ошибка сида:", e.message)
        process.exitCode = 1
    })
    .finally(() => sequelize.close())

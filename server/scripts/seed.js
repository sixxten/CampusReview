const bcrypt = require("bcryptjs")
const sequelize = require("../db")
const { User, Faculty, Semester, Course, Review, Favorite } = require("../models")
const reviewService = require("../services/reviewService")
const data = require("./seedData")
const { reviews } = require("./seedReviews")

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

    const courses = {}
    for (const { teacher, faculty, semester, ...fields } of data.courses) {
        const teacherId = users[teacher].id
        const [course] = await Course.findOrCreate({
            where: { title: fields.title, teacherId },
            defaults: {
                ...fields,
                status: fields.status || "published",
                teacherId,
                facultyId: faculties[faculty].id,
                semesterId: semesters[semester].id
            }
        })
        courses[fields.title] = course
    }

    for (const { student, course, semester, ...fields } of reviews) {
        const { usefulness, atmosphere, practicalValue } = fields
        const rating =
            usefulness && atmosphere && practicalValue
                ? Math.round(((usefulness + atmosphere + practicalValue) / 3) * 10) / 10
                : null
        const status = fields.status || "published"

        await Review.findOrCreate({
            where: { userId: users[student].id, courseId: courses[course].id },
            defaults: {
                ...fields,
                status,
                rating,
                semesterId: semesters[semester].id,
                moderatedAt: status === "published" || status === "rejected" ? new Date() : null
            }
        })
    }

    for (const [email, titles] of Object.entries(data.favorites)) {
        for (const title of titles) {
            await Favorite.findOrCreate({ where: { userId: users[email].id, courseId: courses[title].id } })
        }
    }

    for (const course of Object.values(courses)) {
        await reviewService.recalcCourseRating(course.id)
    }

    console.log("Готово! Сейчас в базе:")
    console.log(`  факультетов: ${await Faculty.count()}`)
    console.log(`  семестров:   ${await Semester.count()}`)
    console.log(`  пользователей: ${await User.count()}`)
    console.log(`  курсов: ${await Course.count()} (опубликовано: ${await Course.count({ where: { status: "published" } })})`)
    console.log(`  отзывов: ${await Review.count()} (опубликовано: ${await Review.count({ where: { status: "published" } })})`)
    console.log(`  в избранном: ${await Favorite.count()}`)
    console.log(`Пароль демо-пользователей: ${data.DEMO_PASSWORD}`)
}

seed()
    .catch((e) => {
        console.error("Ошибка сида:", e.message)
        process.exitCode = 1
    })
    .finally(() => sequelize.close())

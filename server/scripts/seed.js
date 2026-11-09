const bcrypt = require("bcryptjs")
const sequelize = require("../db")
const { User, Faculty, Semester, Course, Review, Favorite, Complaint, Notification } = require("../models")
const reviewService = require("../services/reviewService")
const notificationService = require("../services/notificationService")
const data = require("./seedData")
const { reviews, complaints } = require("./seedReviews")

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

    for (const { from, reviewAuthor, course, status, ...fields } of complaints) {
        const review = await Review.findOne({ where: { userId: users[reviewAuthor].id, courseId: courses[course].id } })
        if (!review) continue
        await Complaint.findOrCreate({
            where: { userId: users[from].id, reviewId: review.id },
            defaults: { ...fields, status: status || "new", resolvedAt: status ? new Date() : null }
        })
    }

    for (const course of Object.values(courses)) {
        await reviewService.recalcCourseRating(course.id)
    }

    if ((await Notification.count()) === 0) {
        await seedNotifications()
    }

    console.log("Готово! Сейчас в базе:")
    console.log(`  факультетов: ${await Faculty.count()}`)
    console.log(`  семестров:   ${await Semester.count()}`)
    console.log(`  пользователей: ${await User.count()}`)
    console.log(`  курсов: ${await Course.count()} (опубликовано: ${await Course.count({ where: { status: "published" } })})`)
    console.log(`  отзывов: ${await Review.count()} (опубликовано: ${await Review.count({ where: { status: "published" } })})`)
    console.log(`  в избранном: ${await Favorite.count()}`)
    console.log(`  жалоб: ${await Complaint.count()} (новых: ${await Complaint.count({ where: { status: "new" } })})`)
    console.log(`  уведомлений: ${await Notification.count()} (непрочитанных: ${await Notification.count({ where: { isRead: false } })})`)
    console.log(`Пароль демо-пользователей: ${data.DEMO_PASSWORD}`)
}

async function seedNotifications() {
    const reviews = await Review.findAll({
        where: { status: ["published", "rejected"] },
        include: [{ model: Course, attributes: ["id", "title", "teacherId"] }],
        order: [["id", "ASC"]]
    })

    for (const [index, review] of reviews.entries()) {
        const isRecent = index >= reviews.length - 4
        const created = []
        if (review.status === "published") {
            created.push(await notificationService.reviewPublished(review, review.course))
            created.push(await notificationService.newReviewOnCourse(review.course))
        } else {
            created.push(await notificationService.reviewRejected(review, review.course))
        }
        if (!isRecent && review.status === "published") {
            for (const notification of created) await notification.update({ isRead: true })
        }
    }

    const resolved = await Complaint.findAll({
        where: { status: ["accepted", "rejected"] },
        include: [{ model: Review, include: [{ model: Course, attributes: ["id", "title"] }] }]
    })
    for (const complaint of resolved) {
        await notificationService.complaintResolved(complaint, complaint.review.course, complaint.status === "accepted")
    }
}

seed()
    .catch((e) => {
        console.error("Ошибка сида:", e.message)
        process.exitCode = 1
    })
    .finally(() => sequelize.close())

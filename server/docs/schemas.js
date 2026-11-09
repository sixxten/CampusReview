const { ref } = require("./helpers")

const id = { type: "integer", example: 1 }
const date = { type: "string", format: "date-time", example: "2026-11-09T12:00:00.000Z" }
const score = { type: "integer", minimum: 1, maximum: 5, example: 4 }

const ROLES = ["student", "teacher", "admin"]
const USER_STATUSES = ["active", "pending", "blocked"]
const FORMATS = ["lectures", "seminars", "projects"]
const MODERATION_STATUSES = ["draft", "pending", "published", "rejected"]
const COMPLAINT_REASONS = ["offensive", "irrelevant", "false_info", "spam", "other"]
const NOTIFICATION_TYPES = [
    "review_published",
    "review_rejected",
    "review_hidden",
    "complaint_resolved",
    "teacher_approved",
    "account_unblocked",
    "course_new_review",
    "review_reply",
    "course_published",
    "course_rejected"
]

const personShort = {
    type: "object",
    properties: {
        id,
        firstName: { type: "string", example: "Игорь" },
        lastName: { type: "string", example: "Иванов" }
    }
}

const schemas = {
    Message: {
        type: "object",
        properties: { message: { type: "string", example: "Готово" } }
    },
    Error: {
        type: "object",
        properties: {
            message: { type: "string", example: "Ошибка валидации" },
            errors: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        path: { type: "string", example: "email" },
                        msg: { type: "string", example: "Некорректный email" }
                    }
                }
            }
        }
    },
    User: {
        type: "object",
        properties: {
            id,
            email: { type: "string", format: "email", example: "m.kuznetsova@campus.ru" },
            firstName: { type: "string", example: "Мария" },
            lastName: { type: "string", example: "Кузнецова" },
            role: { type: "string", enum: ROLES, example: "student" },
            status: { type: "string", enum: USER_STATUSES, example: "active" }
        }
    },
    AdminUser: {
        allOf: [ref("User"), { type: "object", properties: { createdAt: date } }]
    },
    AuthResponse: {
        type: "object",
        description: "Refresh-токен приходит в httpOnly-cookie refreshToken, в теле его нет",
        properties: {
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: ref("User")
        }
    },
    Faculty: {
        type: "object",
        properties: {
            id,
            name: { type: "string", example: "Факультет информационных технологий" },
            shortName: { type: "string", example: "ИТ" }
        }
    },
    Semester: {
        type: "object",
        properties: {
            id,
            name: { type: "string", example: "Осень 2026" },
            year: { type: "integer", example: 2026 },
            season: { type: "string", enum: ["autumn", "spring"], example: "autumn" }
        }
    },
    Course: {
        type: "object",
        properties: {
            id,
            title: { type: "string", example: "Базы данных" },
            description: { type: "string", example: "Проектирование реляционных БД, SQL, индексы и транзакции." },
            program: { type: "string", nullable: true, example: "1. Реляционная модель\n2. SQL\n3. Индексы" },
            hours: { type: "integer", example: 144 },
            formats: { type: "array", items: { type: "string", enum: FORMATS }, example: ["lectures", "projects"] },
            status: { type: "string", enum: MODERATION_STATUSES, example: "published" },
            avgRating: { type: "number", example: 4.4 },
            avgDifficulty: { type: "number", example: 3.3 },
            reviewsCount: { type: "integer", example: 4 },
            facultyId: id,
            semesterId: id,
            teacherId: { type: "integer", example: 3 },
            faculty: ref("Faculty"),
            semester: ref("Semester"),
            teacher: personShort,
            createdAt: date,
            updatedAt: date
        }
    },
    ModerationCourse: {
        allOf: [
            ref("Course"),
            {
                type: "object",
                properties: {
                    rejectionReason: { type: "string", nullable: true, example: "Нет программы курса" },
                    moderatedAt: { ...date, nullable: true },
                    teacher: {
                        allOf: [personShort, { type: "object", properties: { email: { type: "string", example: "i.ivanov@campus.ru" } } }]
                    }
                }
            }
        ]
    },
    TeacherCourse: {
        allOf: [
            ref("Course"),
            {
                type: "object",
                properties: {
                    rejectionReason: { type: "string", nullable: true, example: null },
                    unansweredCount: { type: "integer", example: 2 }
                }
            }
        ]
    },
    CourseInput: {
        type: "object",
        required: ["title", "description", "hours", "formats", "facultyId", "semesterId"],
        properties: {
            title: { type: "string", minLength: 3, maxLength: 150, example: "Разработка игр на Unity" },
            description: { type: "string", minLength: 30, maxLength: 3000, example: "Практический курс: игровой цикл, физика, анимации и сборка под разные платформы." },
            program: { type: "string", maxLength: 5000, example: "1. Знакомство с Unity\n2. Скрипты на C#\n3. Защита проекта" },
            hours: { type: "integer", minimum: 1, maximum: 1000, example: 108 },
            formats: { type: "array", minItems: 1, items: { type: "string", enum: FORMATS }, example: ["lectures", "projects"] },
            facultyId: id,
            semesterId: { type: "integer", example: 2 },
            submit: { type: "boolean", description: "true — отправить на модерацию, false — сохранить черновик", example: true }
        }
    },
    Scores: {
        type: "object",
        properties: {
            usefulness: score,
            difficulty: { ...score, example: 3 },
            workload: { ...score, example: 3 },
            atmosphere: { ...score, example: 5 },
            practicalValue: { ...score, example: 5 }
        }
    },
    Reply: {
        type: "object",
        properties: {
            id,
            text: { type: "string", example: "Спасибо за отзыв! Учли замечание про транзакции." },
            createdAt: date,
            updatedAt: date,
            teacher: personShort
        }
    },
    PublicReview: {
        allOf: [
            ref("Scores"),
            {
                type: "object",
                properties: {
                    id,
                    rating: { type: "number", example: 4.7, description: "Среднее полезности, атмосферы и практической ценности" },
                    pros: { type: "string", nullable: true, example: "Много практики, понятные лекции" },
                    cons: { type: "string", nullable: true, example: "Жёсткие дедлайны" },
                    advice: { type: "string", nullable: true, example: "Начинайте проект заранее" },
                    semester: { type: "object", properties: { id, name: { type: "string", example: "Осень 2025" } } },
                    author: { ...personShort, nullable: true, description: "null, если отзыв анонимный" },
                    course: { type: "object", properties: { id, title: { type: "string", example: "Базы данных" } } },
                    reply: { allOf: [ref("Reply")], nullable: true },
                    createdAt: date
                }
            }
        ]
    },
    Review: {
        allOf: [
            ref("Scores"),
            {
                type: "object",
                properties: {
                    id,
                    userId: id,
                    courseId: id,
                    semesterId: { type: "integer", nullable: true, example: 1 },
                    rating: { type: "number", nullable: true, example: 4.7 },
                    pros: { type: "string", nullable: true },
                    cons: { type: "string", nullable: true },
                    advice: { type: "string", nullable: true },
                    isAnonymous: { type: "boolean", example: false },
                    status: { type: "string", enum: MODERATION_STATUSES, example: "pending" },
                    rejectionReason: { type: "string", nullable: true, example: null },
                    moderatedAt: { ...date, nullable: true },
                    createdAt: date,
                    updatedAt: date
                }
            }
        ]
    },
    MyReview: {
        allOf: [
            ref("Review"),
            {
                type: "object",
                properties: {
                    course: { type: "object", properties: { id, title: { type: "string", example: "Базы данных" } } },
                    semester: { type: "object", nullable: true, properties: { id, name: { type: "string", example: "Осень 2025" } } },
                    reply: { allOf: [ref("Reply")], nullable: true }
                }
            }
        ]
    },
    ModerationReview: {
        allOf: [
            ref("Review"),
            {
                type: "object",
                properties: {
                    course: { type: "object", properties: { id, title: { type: "string", example: "Базы данных" } } },
                    author: { allOf: [personShort, { type: "object", properties: { email: { type: "string", example: "m.kuznetsova@campus.ru" } } }] },
                    semester: { type: "object", nullable: true, properties: { id, name: { type: "string" } } }
                }
            }
        ]
    },
    ReviewInput: {
        allOf: [
            ref("Scores"),
            {
                type: "object",
                description: "Для черновика все поля необязательны. При submit=true нужны семестр, все 5 оценок и от 20 символов текста",
                properties: {
                    semesterId: { type: "integer", nullable: true, example: 1 },
                    pros: { type: "string", maxLength: 2000, example: "Много практики, понятные лекции" },
                    cons: { type: "string", maxLength: 2000, example: "Жёсткие дедлайны" },
                    advice: { type: "string", maxLength: 2000, example: "Начинайте проект заранее" },
                    isAnonymous: { type: "boolean", example: false },
                    submit: { type: "boolean", description: "true — на модерацию, false — черновик", example: true }
                }
            }
        ]
    },
    CourseStats: {
        type: "object",
        properties: {
            count: { type: "integer", example: 4 },
            rating: { type: "number", example: 4.4 },
            averages: ref("Scores"),
            distribution: {
                type: "object",
                description: "Сколько отзывов с итоговой оценкой 1…5",
                example: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 1 },
                additionalProperties: { type: "integer" }
            }
        }
    },
    Complaint: {
        type: "object",
        properties: {
            id,
            reason: { type: "string", enum: COMPLAINT_REASONS, example: "spam" },
            comment: { type: "string", nullable: true, example: "Реклама репетитора" },
            status: { type: "string", enum: ["new", "accepted", "rejected"], example: "new" },
            resolvedAt: { ...date, nullable: true },
            createdAt: date,
            author: { allOf: [personShort, { type: "object", properties: { email: { type: "string" } } }] },
            review: ref("ModerationReview")
        }
    },
    Notification: {
        type: "object",
        properties: {
            id,
            type: { type: "string", enum: NOTIFICATION_TYPES, example: "review_published" },
            title: { type: "string", example: "Ваш отзыв о курсе «Базы данных» опубликован" },
            message: { type: "string", nullable: true, example: "Спасибо! Теперь его видят все, кто выбирает этот курс." },
            link: { type: "string", nullable: true, example: "/courses/1" },
            isRead: { type: "boolean", example: false },
            createdAt: date
        }
    }
}

module.exports = { schemas, FORMATS, COMPLAINT_REASONS, ROLES, USER_STATUSES }

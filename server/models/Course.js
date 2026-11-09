const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const COURSE_FORMATS = ["lectures", "seminars", "projects"]

const COURSE_STATUSES = ["draft", "pending", "published", "rejected"]

const Course = sequelize.define("course", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    program: { type: DataTypes.TEXT, allowNull: true },
    hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 1000 }
    },
    formats: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        validate: {
            isValidFormats(value) {
                if (!Array.isArray(value) || value.length === 0) {
                    throw new Error("Укажите хотя бы один формат")
                }
                if (!value.every((format) => COURSE_FORMATS.includes(format))) {
                    throw new Error("Неизвестный формат курса")
                }
            }
        }
    },
    status: {
        type: DataTypes.ENUM(...COURSE_STATUSES),
        allowNull: false,
        defaultValue: "draft"
    },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
    moderatedAt: { type: DataTypes.DATE, allowNull: true },

    avgRating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    avgDifficulty: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    reviewsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
})

module.exports = { Course, COURSE_FORMATS, COURSE_STATUSES }

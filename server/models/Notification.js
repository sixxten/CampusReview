const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const NOTIFICATION_TYPES = [
    "review_published",
    "review_rejected",
    "review_hidden",
    "complaint_resolved",
    "teacher_approved",
    "account_unblocked",
    "course_new_review",
    "review_reply"
]

const Notification = sequelize.define("notification", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.ENUM(...NOTIFICATION_TYPES), allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: true },
    link: { type: DataTypes.STRING(255), allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
})

module.exports = { Notification, NOTIFICATION_TYPES }

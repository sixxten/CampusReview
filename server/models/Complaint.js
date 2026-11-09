const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const COMPLAINT_REASONS = ["offensive", "irrelevant", "false_info", "spam", "other"]

const COMPLAINT_STATUSES = ["new", "accepted", "rejected"]

const Complaint = sequelize.define(
    "complaint",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        reason: { type: DataTypes.ENUM(...COMPLAINT_REASONS), allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: true },
        status: { type: DataTypes.ENUM(...COMPLAINT_STATUSES), allowNull: false, defaultValue: "new" },
        resolvedAt: { type: DataTypes.DATE, allowNull: true }
    },
    {
        indexes: [{ unique: true, fields: ["userId", "reviewId"] }]
    }
)

module.exports = { Complaint, COMPLAINT_REASONS, COMPLAINT_STATUSES }

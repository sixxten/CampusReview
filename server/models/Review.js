const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const REVIEW_STATUSES = ["draft", "pending", "published", "rejected"]

const SCORE_FIELDS = ["usefulness", "difficulty", "workload", "atmosphere", "practicalValue"]

const score = () => ({
    type: DataTypes.SMALLINT,
    allowNull: true,
    validate: { min: 1, max: 5 }
})

const Review = sequelize.define(
    "review",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        usefulness: score(),
        difficulty: score(),
        workload: score(),
        atmosphere: score(),
        practicalValue: score(),

        rating: { type: DataTypes.FLOAT, allowNull: true },

        pros: { type: DataTypes.TEXT, allowNull: true },
        cons: { type: DataTypes.TEXT, allowNull: true },
        advice: { type: DataTypes.TEXT, allowNull: true },

        isAnonymous: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

        status: {
            type: DataTypes.ENUM(...REVIEW_STATUSES),
            allowNull: false,
            defaultValue: "draft"
        },
        rejectionReason: { type: DataTypes.TEXT, allowNull: true },
        moderatedAt: { type: DataTypes.DATE, allowNull: true }
    },
    {
        indexes: [{ unique: true, fields: ["userId", "courseId"] }]
    }
)

module.exports = { Review, REVIEW_STATUSES, SCORE_FIELDS }

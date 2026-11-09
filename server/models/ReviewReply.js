const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const ReviewReply = sequelize.define(
    "review_reply",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        text: { type: DataTypes.TEXT, allowNull: false }
    },
    {
        indexes: [{ unique: true, fields: ["reviewId"] }]
    }
)

module.exports = { ReviewReply }

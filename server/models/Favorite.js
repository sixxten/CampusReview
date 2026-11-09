const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const Favorite = sequelize.define(
    "favorite",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
    },
    {
        indexes: [{ unique: true, fields: ["userId", "courseId"] }]
    }
)

module.exports = { Favorite }

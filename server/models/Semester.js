const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const SEASONS = ["autumn", "spring"]

const Semester = sequelize.define("semester", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    year: { type: DataTypes.INTEGER, allowNull: false },
    season: { type: DataTypes.ENUM(...SEASONS), allowNull: false }
})

module.exports = { Semester, SEASONS }

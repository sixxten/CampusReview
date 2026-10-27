const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const ROLES = ["student", "teacher", "admin"]
const STATUS = ["active", "pending", "blocked"]

const User = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING(50), allowNull: false },
    lastName: { type: DataTypes.STRING(50), allowNull: false },
    role: {
        type: DataTypes.ENUM(...ROLES),
        allowNull: false,
        defaultValue: "student"
    },
    status: {
        type: DataTypes.ENUM(...STATUS),
        allowNull: false,
        defaultValue: "active"
    }
})

module.exports = { User, ROLES, STATUS }

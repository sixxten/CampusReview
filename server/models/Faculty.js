const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const Faculty = sequelize.define("faculty", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    shortName: { type: DataTypes.STRING(30), allowNull: false }
})

module.exports = { Faculty }

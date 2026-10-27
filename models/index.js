const { User, ROLES, STATUSES } = require("./User")
const { Token } = require("./Token")

User.hasMany(Token, { foreignKey: { name: "userId", allowNull: false }, onDelete: "CASCADE" })
Token.belongsTo(User, { foreignKey: "userId" })

module.exports = { User, Token, ROLES, STATUSES }

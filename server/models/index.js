const { User, ROLES, STATUSES } = require("./User")
const { Token } = require("./Token")
const { Faculty } = require("./Faculty")
const { Semester, SEASONS } = require("./Semester")
const { Course, COURSE_FORMATS, COURSE_STATUSES } = require("./Course")


User.hasMany(Token, { foreignKey: { name: "userId", allowNull: false }, onDelete: "CASCADE" })
Token.belongsTo(User, { foreignKey: "userId" })

User.belongsTo(Faculty, { foreignKey: { name: "facultyId", allowNull: true }, onDelete: "SET NULL" })
Faculty.hasMany(User, { foreignKey: { name: "facultyId", allowNull: true }, onDelete: "SET NULL" })

Course.belongsTo(Faculty, { foreignKey: { name: "facultyId", allowNull: false }, onDelete: "RESTRICT" })
Faculty.hasMany(Course, { foreignKey: { name: "facultyId", allowNull: false }, onDelete: "RESTRICT" })

Course.belongsTo(Semester, { foreignKey: { name: "semesterId", allowNull: false }, onDelete: "RESTRICT" })
Semester.hasMany(Course, { foreignKey: { name: "semesterId", allowNull: false }, onDelete: "RESTRICT" })

Course.belongsTo(User, { as: "teacher", foreignKey: { name: "teacherId", allowNull: false }, onDelete: "RESTRICT" })
User.hasMany(Course, { as: "courses", foreignKey: { name: "teacherId", allowNull: false }, onDelete: "RESTRICT" })

module.exports = {
    User,
    Token,
    Faculty,
    Semester,
    Course,
    ROLES,
    STATUSES,
    SEASONS,
    COURSE_FORMATS,
    COURSE_STATUSES
}

const { User, ROLES, STATUSES } = require("./User")
const { Token } = require("./Token")
const { Faculty } = require("./Faculty")
const { Semester, SEASONS } = require("./Semester")
const { Course, COURSE_FORMATS, COURSE_STATUSES } = require("./Course")
const { Review, REVIEW_STATUSES, SCORE_FIELDS } = require("./Review")

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

Review.belongsTo(User, { as: "author", foreignKey: { name: "userId", allowNull: false }, onDelete: "CASCADE" })
User.hasMany(Review, { as: "reviews", foreignKey: { name: "userId", allowNull: false }, onDelete: "CASCADE" })

Review.belongsTo(Course, { foreignKey: { name: "courseId", allowNull: false }, onDelete: "CASCADE" })
Course.hasMany(Review, { foreignKey: { name: "courseId", allowNull: false }, onDelete: "CASCADE" })

Review.belongsTo(Semester, { foreignKey: { name: "semesterId", allowNull: true }, onDelete: "SET NULL" })
Semester.hasMany(Review, { foreignKey: { name: "semesterId", allowNull: true }, onDelete: "SET NULL" })

Review.belongsTo(User, { as: "moderator", foreignKey: { name: "moderatorId", allowNull: true }, onDelete: "SET NULL" })

module.exports = {
    User,
    Token,
    Faculty,
    Semester,
    Course,
    Review,
    ROLES,
    STATUSES,
    SEASONS,
    COURSE_FORMATS,
    COURSE_STATUSES,
    REVIEW_STATUSES,
    SCORE_FIELDS
}

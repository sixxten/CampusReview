const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const config = require("config")
const { Token } = require("../models")

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, config.get("jwt.accessSecret"), {
            expiresIn: config.get("jwt.accessExpiresIn")
        })
        const refreshToken = jwt.sign(payload, config.get("jwt.refreshSecret"), {
            expiresIn: config.get("jwt.refreshExpiresIn"),
            jwtid: crypto.randomUUID()
        })
        return { accessToken, refreshToken }
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, config.get("jwt.accessSecret"))
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, config.get("jwt.refreshSecret"))
        } catch (e) {
            return null
        }
    }

    async saveToken(userId, refreshToken) {
        return Token.create({ userId, refreshToken })
    }

    async removeToken(refreshToken) {
        return Token.destroy({ where: { refreshToken } })
    }

    async findToken(refreshToken) {
        return Token.findOne({ where: { refreshToken } })
    }
}

module.exports = new TokenService()

const { body, ok, errors, bearer } = require("../helpers")
const { COMPLAINT_REASONS } = require("../schemas")

module.exports = {
    "/complaints": {
        post: {
            tags: ["Жалобы"],
            summary: "Пожаловаться на отзыв",
            description: "Студенты и преподаватели. Нельзя жаловаться на свой отзыв и дважды на один и тот же. При reason=other комментарий обязателен.",
            security: bearer,
            requestBody: body(
                {
                    type: "object",
                    required: ["reviewId", "reason"],
                    properties: {
                        reviewId: { type: "integer" },
                        reason: { type: "string", enum: COMPLAINT_REASONS },
                        comment: { type: "string", maxLength: 500 }
                    }
                },
                { reviewId: 5, reason: "spam", comment: "Реклама репетитора" }
            ),
            responses: {
                201: ok("Жалоба создана", { type: "object", properties: { id: { type: "integer" }, message: { type: "string" } } }, { id: 4, message: "Жалоба отправлена" }),
                ...errors(400, 401, 403, 404)
            }
        }
    }
}

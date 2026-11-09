const ref = (name) => ({ $ref: `#/components/schemas/${name}` })

const json = (schema, example) => ({
    "application/json": example === undefined ? { schema } : { schema, example }
})

const body = (schema, example) => ({ required: true, content: json(schema, example) })

const ok = (description, schema, example) => ({ description, content: json(schema, example) })

const message = (text) => ok(text, ref("Message"), { message: text })

const ERRORS = {
    400: { description: "Ошибка валидации", content: json(ref("Error"), { message: "Ошибка валидации", errors: [{ path: "email", msg: "Некорректный email" }] }) },
    401: { description: "Нет access-токена или он истёк", content: json(ref("Error"), { message: "Пользователь не авторизован", errors: [] }) },
    403: { description: "Нет доступа для этой роли или статуса", content: json(ref("Error"), { message: "Нет доступа", errors: [] }) },
    404: { description: "Не найдено", content: json(ref("Error"), { message: "Не найдено", errors: [] }) }
}

const errors = (...codes) => Object.fromEntries(codes.map((code) => [code, ERRORS[code]]))

const pathId = (name = "id", description = "Идентификатор") => ({
    name,
    in: "path",
    required: true,
    description,
    schema: { type: "integer", minimum: 1 }
})

const queryParam = (name, schema, description) => ({ name, in: "query", required: false, description, schema })

const pageParams = (max = 50) => [
    queryParam("page", { type: "integer", minimum: 1, default: 1 }, "Номер страницы"),
    queryParam("limit", { type: "integer", minimum: 1, maximum: max }, "Сколько записей на странице")
]

const page = (itemsKey, itemSchema, extra = {}) => ({
    type: "object",
    properties: {
        [itemsKey]: { type: "array", items: itemSchema },
        total: { type: "integer", example: 42 },
        page: { type: "integer", example: 1 },
        pages: { type: "integer", example: 5 },
        ...extra
    }
})

const bearer = [{ bearerAuth: [] }]

module.exports = { ref, json, body, ok, message, errors, pathId, queryParam, pageParams, page, bearer }

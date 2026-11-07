import axios from "axios"

export const TOKEN_KEY = "accessToken"

const config = { baseURL: import.meta.env.VITE_API_URL, withCredentials: true }

export const host = axios.create(config)

export const authHost = axios.create(config)

authHost.interceptors.request.use((request) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
        request.headers.Authorization = `Bearer ${token}`
    }
    return request
})

let refreshPromise = null

export function refreshTokens() {
    if (!refreshPromise) {
        refreshPromise = host
            .post("/user/refresh")
            .then(({ data }) => {
                localStorage.setItem(TOKEN_KEY, data.accessToken)
                return data
            })
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
}

let onAuthFailure = () => {}
export function setOnAuthFailure(callback) {
    onAuthFailure = callback
}

authHost.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                await refreshTokens()
                return authHost.request(originalRequest)
            } catch {
                localStorage.removeItem(TOKEN_KEY)
                onAuthFailure()
            }
        }
        throw error
    }
)

export function parseApiError(error) {
    if (!error.response) {
        return { message: "Сервер недоступен. Проверьте, что он запущен.", fieldErrors: {} }
    }

    const { message, errors = [] } = error.response.data || {}
    const fieldErrors = {}
    for (const item of errors) {
        if (item.path && !fieldErrors[item.path]) {
            fieldErrors[item.path] = item.msg
        }
    }
    return { message: message || "Что-то пошло не так", fieldErrors }
}

export const userApi = {
    registration: (payload) => host.post("/user/registration", payload).then((res) => res.data),

    login: (payload) => host.post("/user/login", payload).then((res) => res.data),

    logout: () => host.post("/user/logout").then((res) => res.data),

    fetchMe: () => authHost.get("/user/me").then((res) => res.data),

    updateProfile: (payload) => authHost.patch("/user/me", payload).then((res) => res.data),

    changePassword: (payload) => authHost.patch("/user/me/password", payload).then((res) => res.data)
}

export const adminApi = {
    getUsers: (params) => authHost.get("/admin/users", { params }).then((res) => res.data),

    updateUserStatus: (id, status) =>
        authHost.patch(`/admin/users/${id}/status`, { status }).then((res) => res.data)
}

export const courseApi = {
    getCourses: (params) => host.get("/courses", { params }).then((res) => res.data),

    getCourse: (id) => host.get(`/courses/${id}`).then((res) => res.data),

    getFilterOptions: () => host.get("/courses/filters").then((res) => res.data)
}

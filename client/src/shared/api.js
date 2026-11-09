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
        return { message: "Сервер недоступен.", fieldErrors: {} }
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
    getStats: () => authHost.get("/admin/stats").then((res) => res.data),

    getReviews: (params) => authHost.get("/admin/reviews", { params }).then((res) => res.data),

    moderateReview: (id, decision) => authHost.patch(`/admin/reviews/${id}`, decision).then((res) => res.data),

    getComplaints: (params) => authHost.get("/admin/complaints", { params }).then((res) => res.data),

    resolveComplaint: (id, status) => authHost.patch(`/admin/complaints/${id}`, { status }).then((res) => res.data),

    getUsers: (params) => authHost.get("/admin/users", { params }).then((res) => res.data),

    updateUserStatus: (id, status) =>
        authHost.patch(`/admin/users/${id}/status`, { status }).then((res) => res.data)
}

export const courseApi = {
    getCourses: (params) => host.get("/courses", { params }).then((res) => res.data),

    getCourse: (id) => host.get(`/courses/${id}`).then((res) => res.data),

    getFilterOptions: () => host.get("/courses/filters").then((res) => res.data)
}

export const reviewApi = {
    getCourseReviews: (courseId, params) =>
        host.get(`/courses/${courseId}/reviews`, { params }).then((res) => res.data),

    getCourseStats: (courseId) => host.get(`/courses/${courseId}/stats`).then((res) => res.data),

    getMy: (params) => authHost.get("/reviews/my", { params }).then((res) => res.data),

    create: (payload) => authHost.post("/reviews", payload).then((res) => res.data),

    update: (id, payload) => authHost.put(`/reviews/${id}`, payload).then((res) => res.data),

    remove: (id) => authHost.delete(`/reviews/${id}`).then((res) => res.data)
}

export const favoriteApi = {
    getMy: () => authHost.get("/favorites").then((res) => res.data),

    getIds: () => authHost.get("/favorites/ids").then((res) => res.data),

    add: (courseId) => authHost.post(`/favorites/${courseId}`).then((res) => res.data),

    remove: (courseId) => authHost.delete(`/favorites/${courseId}`).then((res) => res.data)
}

export const complaintApi = {
    create: (payload) => authHost.post("/complaints", payload).then((res) => res.data)
}

export const notificationApi = {
    getMy: (params) => authHost.get("/notifications", { params }).then((res) => res.data),
    getUnreadCount: () => authHost.get("/notifications/unread-count").then((res) => res.data.count),
    markRead: (id) => authHost.patch(`/notifications/${id}/read`).then((res) => res.data),
    markAllRead: () => authHost.patch("/notifications/read-all").then((res) => res.data)
}

export const teacherApi = {
    getCourses: () => authHost.get("/teacher/courses").then((res) => res.data),
    getReviews: (params) => authHost.get("/teacher/reviews", { params }).then((res) => res.data),
    saveReply: (reviewId, text) => authHost.put(`/teacher/reviews/${reviewId}/reply`, { text }).then((res) => res.data),
    removeReply: (reviewId) => authHost.delete(`/teacher/reviews/${reviewId}/reply`).then((res) => res.data)
}

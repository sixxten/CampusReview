import { makeAutoObservable, runInAction } from "mobx"
import { refreshTokens, setOnAuthFailure, TOKEN_KEY, userApi } from "@/shared/api"

export class UserStore {
    user = null
    isAuth = false
    isChecking = true

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        // сессия истекла посреди работы — разлогиниваем
        setOnAuthFailure(this.reset)
    }

    get role() {
        return this.user?.role ?? null
    }

    get fullName() {
        return this.user ? `${this.user.firstName} ${this.user.lastName}` : ""
    }

    setAuth({ accessToken, user }) {
        localStorage.setItem(TOKEN_KEY, accessToken)
        this.user = user
        this.isAuth = true
    }

    setUser(user) {
        this.user = user
    }

    reset() {
        localStorage.removeItem(TOKEN_KEY)
        this.user = null
        this.isAuth = false
    }

    async login(email, password) {
        const data = await userApi.login({ email, password })
        this.setAuth(data)
        return data.user
    }

    async registration(form) {
        const data = await userApi.registration(form)
        this.setAuth(data)
        return data.user
    }

    async updateProfile(data) {
        const user = await userApi.updateProfile(data)
        this.setUser(user)
        return user
    }

    async logout() {
        try {
            await userApi.logout()
        } finally {
            this.reset()
        }
    }

    async checkAuth() {

        if (!localStorage.getItem(TOKEN_KEY)) {
            this.isChecking = false
            return
        }
        try {
            const data = await refreshTokens()
            this.setAuth(data)
        } catch {
            this.reset()
        } finally {
            runInAction(() => {
                this.isChecking = false
            })
        }
    }
}

import { useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import { StoreContext, stores } from "@/store"
import { AppRouter } from "@/router/AppRouter"

export function App() {
    useEffect(() => {
        stores.userStore.checkAuth()
    }, [])

    return (
        <StoreContext.Provider value={stores}>
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </StoreContext.Provider>
    )
}

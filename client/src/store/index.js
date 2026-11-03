import { createContext, useContext } from "react"
import { UserStore } from "./UserStore"

export const stores = {
    userStore: new UserStore()
}

export const StoreContext = createContext(stores)

export const useStores = () => useContext(StoreContext)

import { createContext, useContext } from "react"
import { UserStore } from "./UserStore"
import { NotificationStore } from "./NotificationStore"

export const stores = {
    userStore: new UserStore(),
    notificationStore: new NotificationStore()
}

export const StoreContext = createContext(stores)

export const useStores = () => useContext(StoreContext)

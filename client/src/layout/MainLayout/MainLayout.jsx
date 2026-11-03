import { Outlet } from "react-router-dom"
import { Header } from "@/layout/Header"
import styles from "./MainLayout.module.css"

export function MainLayout() {
    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
            <footer className={styles.footer}>
                <div className="container">© {new Date().getFullYear()} CampusReview </div>
            </footer>
        </div>
    )
}

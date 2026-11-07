import { useState } from "react"
import { observer } from "mobx-react-lite"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useStores } from "@/store"
import { ROLES, ROUTES } from "@/shared/consts"
import { Button } from "@/ui/Button"
import styles from "./Header.module.css"

const NAV_ITEMS = [
    { to: ROUTES.HOME, label: "Каталог курсов" },
    { to: ROUTES.ADMIN, label: "Админ-панель", roles: [ROLES.ADMIN] }
]

export const Header = observer(() => {
    const { userStore } = useStores()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleMenuClick = (event) => {
        if (event.target.closest("a")) {
            setMenuOpen(false)
        }
    }

    const handleLogout = async () => {
        setMenuOpen(false)
        await userStore.logout()
        navigate(ROUTES.HOME)
    }

    const navItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(userStore.role))

    return (
        <header className={styles.header}>
            <div className={`container ${styles.inner}`}>
                <Link to={ROUTES.HOME} className={styles.logo}>
                    Campus<span className={styles.logoAccent}>Review</span>
                </Link>

                <button
                    type="button"
                    className={styles.burger}
                    aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
                    aria-expanded={menuOpen}
                    aria-controls="main-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                    </svg>
                </button>

                <div id="main-menu" className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`} onClick={handleMenuClick}>
                    <nav className={styles.nav} aria-label="Основное меню">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end
                                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className={styles.actions}>
                        {userStore.isChecking ? null : userStore.isAuth ? (
                            <>
                                <NavLink
                                    to={ROUTES.PROFILE}
                                    className={({ isActive }) => `${styles.profile} ${isActive ? styles.profileActive : ""}`}
                                    aria-label="Личный кабинет"
                                    title="Личный кабинет"
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 21a8 8 0 0 1 16 0" />
                                    </svg>
                                    <span className={styles.profileLabel}>Личный кабинет</span>
                                </NavLink>
                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    Выйти
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" to={ROUTES.LOGIN}>
                                    Войти
                                </Button>
                                <Button size="sm" to={ROUTES.REGISTRATION}>
                                    Регистрация
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
})

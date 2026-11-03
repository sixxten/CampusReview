import styles from "./Alert.module.css"

// Сообщение об ошибке или подсказка
export function Alert({ tone = "info", className = "", children }) {
    return (
        <div className={`${styles.alert} ${styles[tone]} ${className}`} role={tone === "danger" ? "alert" : "status"}>
            {children}
        </div>
    )
}

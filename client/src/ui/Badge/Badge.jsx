import styles from "./Badge.module.css"

// Небольшая метка
export function Badge({ tone = "primary", className = "", children }) {
    return <span className={`${styles.badge} ${styles[tone]} ${className}`}>{children}</span>
}

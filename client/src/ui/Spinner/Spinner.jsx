import styles from "./Spinner.module.css"

export function Spinner({ size = "md", label = "Загрузка" }) {
    return (
        <span className={`${styles.spinner} ${styles[size]}`} role="status">
            <span className="visually-hidden">{label}</span>
        </span>
    )
}

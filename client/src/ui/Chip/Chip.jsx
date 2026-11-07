import styles from "./Chip.module.css"

// Кнопка-переключатель для фильтров
export function Chip({ active = false, className = "", children, ...props }) {
    return (
        <button
            type="button"
            className={`${styles.chip} ${active ? styles.active : ""} ${className}`}
            aria-pressed={active}
            {...props}
        >
            {children}
        </button>
    )
}

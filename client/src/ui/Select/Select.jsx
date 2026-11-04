import { useId } from "react"
import styles from "./Select.module.css"

// Выпадающий список

export function Select({ label, options = [], id, className = "", ...props }) {
    const autoId = useId()
    const selectId = id || autoId

    return (
        <div className={`${styles.field} ${className}`}>
            {label && (
                <label htmlFor={selectId} className={styles.label}>
                    {label}
                </label>
            )}
            <div className={styles.wrapper}>
                <select id={selectId} className={styles.select} {...props}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </div>
    )
}

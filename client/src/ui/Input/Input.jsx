import { useId } from "react"
import styles from "./Input.module.css"

// Поле ввода с подписью и ошибкой
export function Input({ label, error, hint, id, className = "", ...props }) {
    const autoId = useId()
    const inputId = id || autoId
    const messageId = `${inputId}-message`

    return (
        <div className={`${styles.field} ${className}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`${styles.input} ${error ? styles.invalid : ""}`}
                aria-invalid={Boolean(error)}
                aria-describedby={error || hint ? messageId : undefined}
                {...props}
            />
            {error ? (
                <span id={messageId} className={styles.error}>
                    {error}
                </span>
            ) : (
                hint && (
                    <span id={messageId} className={styles.hint}>
                        {hint}
                    </span>
                )
            )}
        </div>
    )
}

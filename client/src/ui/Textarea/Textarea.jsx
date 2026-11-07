import { useId } from "react"
import styles from "./Textarea.module.css"

// Многострочное поле с подписью, ошибкой и счётчиком символов
export function Textarea({ label, error, hint, id, maxLength, value = "", rows = 4, className = "", ...props }) {
    const autoId = useId()
    const fieldId = id || autoId
    const messageId = `${fieldId}-message`

    return (
        <div className={`${styles.field} ${className}`}>
            {label && (
                <label htmlFor={fieldId} className={styles.label}>
                    {label}
                </label>
            )}
            <textarea
                id={fieldId}
                className={`${styles.textarea} ${error ? styles.invalid : ""}`}
                rows={rows}
                maxLength={maxLength}
                value={value}
                aria-invalid={Boolean(error)}
                aria-describedby={error || hint ? messageId : undefined}
                {...props}
            />
            <div className={styles.footer}>
                {error ? (
                    <span id={messageId} className={styles.error}>
                        {error}
                    </span>
                ) : (
                    <span id={messageId} className={styles.hint}>
                        {hint}
                    </span>
                )}
                {maxLength && (
                    <span className={styles.counter}>
                        {value.length} / {maxLength}
                    </span>
                )}
            </div>
        </div>
    )
}

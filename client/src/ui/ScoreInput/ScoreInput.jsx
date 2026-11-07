import { useId } from "react"
import styles from "./ScoreInput.module.css"

const SCORES = [1, 2, 3, 4, 5]

// Оценка от 1 до 5: пять кнопок-квадратиков
export function ScoreInput({ label, hint, value, onChange, error, name }) {
    const autoId = useId()
    const groupName = name || autoId
    const labelId = `${autoId}-label`
    const messageId = `${autoId}-message`

    return (
        <div className={styles.group}>
            <div className={styles.text}>
                <span id={labelId} className={styles.label}>
                    {label}
                </span>
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
            <div
                className={styles.scores}
                role="radiogroup"
                aria-labelledby={labelId}
                aria-describedby={error || hint ? messageId : undefined}
                aria-invalid={Boolean(error)}
            >
                {SCORES.map((score) => (
                    <label key={score} className={`${styles.score} ${value === score ? styles.active : ""} ${error ? styles.invalid : ""}`}>
                        <input
                            type="radio"
                            name={groupName}
                            value={score}
                            checked={value === score}
                            onChange={() => onChange(score)}
                            className="visually-hidden"
                        />
                        {score}
                    </label>
                ))}
            </div>
        </div>
    )
}

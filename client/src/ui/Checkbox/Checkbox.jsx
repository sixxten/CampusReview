import styles from "./Checkbox.module.css"


export function Checkbox({ label, className = "", ...props }) {
    return (
        <label className={`${styles.checkbox} ${className}`}>
            <input type="checkbox" className={styles.input} {...props} />
            <span className={styles.box} aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5 10 17 19 7" />
                </svg>
            </span>
            <span>{label}</span>
        </label>
    )
}

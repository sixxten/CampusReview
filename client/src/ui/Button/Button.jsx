import { Link } from "react-router-dom"
import { Spinner } from "@/ui/Spinner"
import styles from "./Button.module.css"


export function Button({
    variant = "primary", 
    size = "md",
    fullWidth = false,
    loading = false,
    to,
    type = "button",
    className = "",
    children,
    disabled,
    ...props
}) {
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : "",
        className
    ].join(" ")

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {children}
            </Link>
        )
    }

    return (
        <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...props}>
            {loading && <Spinner size="sm" />}
            {children}
        </button>
    )
}

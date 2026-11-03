import styles from "./Card.module.css"

// Белая карточка с рамкой
export function Card({ as: Tag = "div", padding = "md", className = "", children, ...props }) {
    return (
        <Tag className={`${styles.card} ${styles[padding]} ${className}`} {...props}>
            {children}
        </Tag>
    )
}

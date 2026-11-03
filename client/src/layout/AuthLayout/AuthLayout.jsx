import { Card } from "@/ui/Card"
import styles from "./AuthLayout.module.css"

export function AuthLayout({ title, subtitle, footer, width = 440, children }) {
    return (
        <div className={styles.page}>
            <Card padding="lg" className={styles.card} style={{ maxWidth: width }}>
                <div className={styles.heading}>
                    <h1>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                {children}
                {footer && <div className={styles.footer}>{footer}</div>}
            </Card>
        </div>
    )
}

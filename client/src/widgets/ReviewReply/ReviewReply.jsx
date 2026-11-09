import styles from "./ReviewReply.module.css"

const formatDate = (value) => new Date(value).toLocaleDateString("ru-RU")

export function ReviewReply({ reply, actions = null }) {
    if (!reply) return null
    const teacher = reply.teacher ? `${reply.teacher.firstName} ${reply.teacher.lastName}` : "Преподаватель"

    return (
        <div className={styles.reply}>
            <div className={styles.header}>
                <span className={styles.label}>Ответ преподавателя</span>
                <span className={styles.meta}>
                    {teacher} · {formatDate(reply.updatedAt || reply.createdAt)}
                </span>
            </div>
            <p className={styles.text}>{reply.text}</p>
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    )
}

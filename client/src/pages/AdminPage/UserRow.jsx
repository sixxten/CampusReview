import { useState } from "react"
import { ROLE_LABELS, ROLES, USER_STATUS, USER_STATUS_LABELS, USER_STATUS_TONE } from "@/shared/consts"
import { Badge } from "@/ui/Badge"
import { Button } from "@/ui/Button"
import styles from "./AdminPage.module.css"

const formatDate = (value) => new Date(value).toLocaleDateString("ru-RU")

const ACTIONS = {
    [USER_STATUS.PENDING]: [
        { action: "approve", label: "Подтвердить", variant: "primary" },
        { action: "reject", label: "Отклонить", variant: "outline" }
    ],
    [USER_STATUS.ACTIVE]: [{ action: "block", label: "Заблокировать", variant: "outline" }],
    [USER_STATUS.BLOCKED]: [{ action: "unblock", label: "Разблокировать", variant: "outline" }]
}

export function UserRow({ user, busy, onAction }) {
    const [clicked, setClicked] = useState(null)
    const actions = user.role === ROLES.ADMIN ? [] : ACTIONS[user.status] || []

    const handleClick = (action) => {
        setClicked(action)
        onAction(user, action)
    }

    return (
        <li className={styles.row}>
            <div className={styles.avatar} aria-hidden="true">
                {user.firstName[0]}
                {user.lastName[0]}
            </div>

            <div className={styles.user}>
                <span className={styles.name}>
                    {user.firstName} {user.lastName}
                </span>
                <span className={styles.email}>{user.email}</span>
            </div>

            <div className={styles.meta}>
                <Badge tone="neutral">{ROLE_LABELS[user.role]}</Badge>
                <Badge tone={USER_STATUS_TONE[user.status]}>{USER_STATUS_LABELS[user.status]}</Badge>
                <span className={styles.date}>с {formatDate(user.createdAt)}</span>
            </div>

            <div className={styles.actions}>
                {actions.map((item) => (
                    <Button
                        key={item.action}
                        size="sm"
                        variant={item.variant}
                        disabled={busy}
                        loading={busy && clicked === item.action}
                        onClick={() => handleClick(item.action)}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>
        </li>
    )
}

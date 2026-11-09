import { useEffect, useState } from "react"
import { favoriteApi } from "@/shared/api"
import { Button } from "@/ui/Button"
import styles from "./CoursePage.module.css"

function HeartIcon({ filled }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        </svg>
    )
}

export function FavoriteToggle({ courseId }) {
    const [state, setState] = useState({ id: null, isFavorite: false })
    const [busy, setBusy] = useState(false)
    const loading = state.id !== courseId

    useEffect(() => {
        let ignore = false
        favoriteApi
            .getIds()
            .then((ids) => {
                if (!ignore) setState({ id: courseId, isFavorite: ids.includes(Number(courseId)) })
            })
            .catch(() => {
                if (!ignore) setState({ id: courseId, isFavorite: false })
            })
        return () => {
            ignore = true
        }
    }, [courseId])

    if (loading) return null

    const toggle = async () => {
        setBusy(true)
        try {
            if (state.isFavorite) await favoriteApi.remove(courseId)
            else await favoriteApi.add(courseId)
            setState((prev) => ({ ...prev, isFavorite: !prev.isFavorite }))
        } finally {
            setBusy(false)
        }
    }

    return (
        <Button
            variant="outline"
            className={state.isFavorite ? styles.favoriteActive : ""}
            aria-pressed={state.isFavorite}
            disabled={busy}
            onClick={toggle}
        >
            <HeartIcon filled={state.isFavorite} />
            {state.isFavorite ? "В избранном" : "В избранное"}
        </Button>
    )
}

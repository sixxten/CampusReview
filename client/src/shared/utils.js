export function plural(count, [one, few, many]) {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return one
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
    return many
}

export const formatRating = (value) => Number(value).toFixed(1)

export function getDifficultyLabel(avgDifficulty) {
    if (avgDifficulty < 2.5) return "Низкая"
    if (avgDifficulty < 3.7) return "Средняя"
    return "Высокая"
}

export function formatRelative(value) {
    const date = new Date(value)
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return "только что"
    if (minutes < 60) return `${minutes} ${plural(minutes, ["минуту", "минуты", "минут"])} назад`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ${plural(hours, ["час", "часа", "часов"])} назад`
    const days = Math.floor(hours / 24)
    if (days === 1) return "вчера"
    if (days < 7) return `${days} ${plural(days, ["день", "дня", "дней"])} назад`
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
}

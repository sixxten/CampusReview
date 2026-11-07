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

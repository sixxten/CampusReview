import { Button } from "@/ui/Button"
import { Checkbox } from "@/ui/Checkbox"
import { Chip } from "@/ui/Chip"
import { Select } from "@/ui/Select"
import { DIFFICULTY_LEVELS, FORMAT_LABELS } from "@/shared/consts"
import styles from "./FilterPanel.module.css"

const RATING_OPTIONS = [
    { value: 0, label: "Любой" },
    { value: 3, label: "3+" },
    { value: 4, label: "4+" },
    { value: 4.5, label: "4.5+" }
]

export function FilterPanel({ filters, faculties, semesters, onChange, onReset }) {
    const toggleFormat = (format) => {
        const formats = filters.formats.includes(format)
            ? filters.formats.filter((item) => item !== format)
            : [...filters.formats, format]
        onChange({ formats })
    }

    return (
        <div className={styles.panel}>
            <h2 className={styles.heading}>Фильтры</h2>

            <Select
                label="Факультет"
                value={filters.facultyId}
                onChange={(event) => onChange({ facultyId: event.target.value })}
                options={[
                    { value: "", label: "Все факультеты" },
                    ...faculties.map((faculty) => ({ value: String(faculty.id), label: faculty.name }))
                ]}
            />

            <Select
                label="Семестр"
                value={filters.semesterId}
                onChange={(event) => onChange({ semesterId: event.target.value })}
                options={[
                    { value: "", label: "Все семестры" },
                    ...semesters.map((semester) => ({ value: String(semester.id), label: semester.name }))
                ]}
            />

            <fieldset className={styles.group}>
                <legend className={styles.legend}>Рейтинг от</legend>
                <div className={styles.chips}>
                    {RATING_OPTIONS.map((option) => (
                        <Chip
                            key={option.value}
                            active={filters.minRating === option.value}
                            onClick={() => onChange({ minRating: option.value })}
                        >
                            {option.label}
                        </Chip>
                    ))}
                </div>
            </fieldset>

            <fieldset className={styles.group}>
                <legend className={styles.legend}>Сложность</legend>
                <div className={styles.chips}>
                    {DIFFICULTY_LEVELS.map((level) => (
                        <Chip
                            key={level.value}
                            active={filters.difficulty === level.value}
                            // повторный клик снимает фильтр
                            onClick={() => onChange({ difficulty: filters.difficulty === level.value ? "" : level.value })}
                        >
                            {level.label}
                        </Chip>
                    ))}
                </div>
            </fieldset>

            <fieldset className={styles.group}>
                <legend className={styles.legend}>Формат</legend>
                <div className={styles.checkboxes}>
                    {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                        <Checkbox
                            key={value}
                            label={label}
                            checked={filters.formats.includes(value)}
                            onChange={() => toggleFormat(value)}
                        />
                    ))}
                </div>
            </fieldset>

            <Button variant="outline" fullWidth onClick={onReset}>
                Сбросить фильтры
            </Button>
        </div>
    )
}

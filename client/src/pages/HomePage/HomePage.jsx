import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "@/store"
import { courseApi, parseApiError } from "@/shared/api"
import { COURSE_SORT_OPTIONS, ROUTES } from "@/shared/consts"
import { useDebouncedValue } from "@/shared/hooks"
import { plural } from "@/shared/utils"
import { CourseCard } from "@/widgets/CourseCard"
import { FilterPanel } from "@/widgets/FilterPanel"
import { Alert } from "@/ui/Alert"
import { Button } from "@/ui/Button"
import { Card } from "@/ui/Card"
import { Input } from "@/ui/Input"
import { Select } from "@/ui/Select"
import { Spinner } from "@/ui/Spinner"
import styles from "./HomePage.module.css"

const PAGE_SIZE = 10

const INITIAL_FILTERS = {
    facultyId: "",
    semesterId: "",
    minRating: 0,
    difficulty: "",
    formats: []
}

export const HomePage = observer(() => {
    const { userStore } = useStores()

    const [search, setSearch] = useState("")
    const [filters, setFilters] = useState(INITIAL_FILTERS)
    const [sort, setSort] = useState("rating")
    const [page, setPage] = useState(1)

    const [data, setData] = useState({ courses: [], total: 0, pages: 1 })
    const [options, setOptions] = useState({ faculties: [], semesters: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filtersOpen, setFiltersOpen] = useState(false) // для мобильной версии

    const debouncedSearch = useDebouncedValue(search.trim())

    useEffect(() => {
        courseApi
            .getFilterOptions()
            .then(setOptions)
            .catch(() => {})
    }, [])

    useEffect(() => {
        let ignore = false

        courseApi
            .getCourses({
                search: debouncedSearch || undefined,
                facultyId: filters.facultyId || undefined,
                semesterId: filters.semesterId || undefined,
                formats: filters.formats.length ? filters.formats.join(",") : undefined,
                minRating: filters.minRating || undefined,
                difficulty: filters.difficulty || undefined,
                sort,
                page,
                limit: PAGE_SIZE
            })
            .then((result) => {
                if (ignore) return
                setData(result)
                setError("")
            })
            .catch((err) => {
                if (ignore) return
                const { message, fieldErrors } = parseApiError(err)
                setError(Object.values(fieldErrors)[0] || message)
                setData({ courses: [], total: 0, pages: 1 })
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })

        return () => {
            ignore = true
        }
    }, [debouncedSearch, filters, sort, page])

    // любое изменение — снова с первой страницы
    const updateFilters = (patch) => {
        setFilters((prev) => ({ ...prev, ...patch }))
        setPage(1)
        setLoading(true)
    }

    const handleSearch = (value) => {
        setSearch(value)
        setPage(1)
        setLoading(true)
    }

    const handleSort = (value) => {
        setSort(value)
        setPage(1)
        setLoading(true)
    }

    const goToPage = (number) => {
        setPage(number)
        setLoading(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const resetFilters = () => {
        setFilters(INITIAL_FILTERS)
        setSearch("")
        setPage(1)
        setLoading(true)
    }

    const activeFiltersCount = [
        filters.facultyId,
        filters.semesterId,
        filters.minRating > 0,
        filters.difficulty,
        filters.formats.length > 0
    ].filter(Boolean).length

    return (
        <div className={`container ${styles.page}`}>
            <h1>Каталог курсов</h1>

            {!userStore.isChecking && !userStore.isAuth && (
                <Card className={styles.banner}>
                    <p className={styles.bannerText}>Войдите, чтобы писать отзывы и сохранять курсы в избранное.</p>
                    <div className={styles.bannerActions}>
                        <Button to={ROUTES.LOGIN}>Войти</Button>
                        <Button variant="outline" to={ROUTES.REGISTRATION}>
                            Регистрация
                        </Button>
                    </div>
                </Card>
            )}

            <form className={styles.search} role="search" onSubmit={(event) => event.preventDefault()}>
                <Input
                    className={styles.searchInput}
                    type="search"
                    aria-label="Поиск по курсам и преподавателям"
                    placeholder="Поиск по названию курса или преподавателю"
                    value={search}
                    onChange={(event) => handleSearch(event.target.value)}
                />
            </form>

            <div className={styles.layout}>
                <Card
                    as="aside"
                    id="catalog-filters"
                    className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`}
                    aria-label="Фильтры каталога"
                >
                    <FilterPanel
                        filters={filters}
                        faculties={options.faculties}
                        semesters={options.semesters}
                        onChange={updateFilters}
                        onReset={resetFilters}
                    />
                </Card>

                <section className={styles.results} aria-label="Список курсов" aria-busy={loading}>
                    <div className={styles.toolbar}>
                        <Button
                            variant="outline"
                            className={styles.filtersToggle}
                            aria-expanded={filtersOpen}
                            aria-controls="catalog-filters"
                            onClick={() => setFiltersOpen((open) => !open)}
                        >
                            {filtersOpen ? "Скрыть фильтры" : "Фильтры"}
                            {activeFiltersCount > 0 && ` · ${activeFiltersCount}`}
                        </Button>
                        <span className={styles.count} aria-live="polite">
                            Найдено {data.total} {plural(data.total, ["курс", "курса", "курсов"])}
                        </span>
                        <Select
                            className={styles.sort}
                            aria-label="Сортировка"
                            value={sort}
                            onChange={(event) => handleSort(event.target.value)}
                            options={COURSE_SORT_OPTIONS}
                        />
                    </div>

                    {error && <Alert tone="danger">{error}</Alert>}

                    {loading && data.courses.length === 0 ? (
                        <div className={styles.loader}>
                            <Spinner />
                        </div>
                    ) : data.courses.length > 0 ? (
                        <div className={styles.list}>
                            {data.courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        !error && (
                            <Card className={styles.empty}>
                                <h2>Ничего не нашлось</h2>
                                <p className={styles.emptyText}>
                                    Попробуйте изменить запрос или сбросить фильтры. Фильтры по рейтингу и сложности
                                    учитывают только курсы с отзывами.
                                </p>
                                <Button variant="outline" onClick={resetFilters}>
                                    Сбросить всё
                                </Button>
                            </Card>
                        )
                    )}

                    {data.pages > 1 && (
                        <nav className={styles.pagination} aria-label="Страницы каталога">
                            {Array.from({ length: data.pages }, (_, index) => index + 1).map((number) => (
                                <Button
                                    key={number}
                                    size="sm"
                                    variant={number === page ? "primary" : "outline"}
                                    aria-current={number === page ? "page" : undefined}
                                    aria-label={`Страница ${number}`}
                                    onClick={() => goToPage(number)}
                                >
                                    {number}
                                </Button>
                            ))}
                        </nav>
                    )}
                </section>
            </div>
        </div>
    )
})

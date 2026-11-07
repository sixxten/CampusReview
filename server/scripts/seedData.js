const DEMO_PASSWORD = "password123"

const faculties = [
    { key: "it", name: "Факультет информационных технологий", shortName: "ИТ" },
    { key: "econ", name: "Экономический факультет", shortName: "Экономика" },
    { key: "hum", name: "Гуманитарный факультет", shortName: "Гуманитарный" },
    { key: "sci", name: "Факультет естественных наук", shortName: "Естественные науки" }
]

const semesters = [
    { key: "spring-2025", name: "Весна 2025", year: 2025, season: "spring" },
    { key: "autumn-2025", name: "Осень 2025", year: 2025, season: "autumn" },
    { key: "spring-2026", name: "Весна 2026", year: 2026, season: "spring" },
    { key: "autumn-2026", name: "Осень 2026", year: 2026, season: "autumn" }
]

const teachers = [
    { email: "i.ivanov@campus.ru", firstName: "Игорь", lastName: "Иванов", faculty: "it" },
    { email: "a.petrova@campus.ru", firstName: "Анна", lastName: "Петрова", faculty: "it" },
    { email: "d.kovalev@campus.ru", firstName: "Дмитрий", lastName: "Ковалёв", faculty: "it" },
    { email: "e.sokolova@campus.ru", firstName: "Елена", lastName: "Соколова", faculty: "econ" },
    { email: "p.morozov@campus.ru", firstName: "Павел", lastName: "Морозов", faculty: "econ" },
    { email: "p.sidorov@campus.ru", firstName: "Пётр", lastName: "Сидоров", faculty: "hum" },
    { email: "n.fedorova@campus.ru", firstName: "Наталья", lastName: "Фёдорова", faculty: "hum" },
    { email: "o.lebedeva@campus.ru", firstName: "Ольга", lastName: "Лебедева", faculty: "sci" },
    { email: "s.orlov@campus.ru", firstName: "Сергей", lastName: "Орлов", faculty: "sci", status: "pending" }
]

const students = [
    { email: "m.kuznetsova@campus.ru", firstName: "Мария", lastName: "Кузнецова", faculty: "it" },
    { email: "a.smirnov@campus.ru", firstName: "Алексей", lastName: "Смирнов", faculty: "it" },
    { email: "n.zaitsev@campus.ru", firstName: "Никита", lastName: "Зайцев", faculty: "it" },
    { email: "d.novikova@campus.ru", firstName: "Дарья", lastName: "Новикова", faculty: "econ" },
    { email: "k.vasiliev@campus.ru", firstName: "Кирилл", lastName: "Васильев", faculty: "hum" },
    { email: "e.popova@campus.ru", firstName: "Екатерина", lastName: "Попова", faculty: "sci" }
]

const courses = [
    // ---------- ИТ ----------
    {
        title: "Базы данных",
        teacher: "i.ivanov@campus.ru",
        faculty: "it",
        semester: "autumn-2026",
        hours: 144,
        formats: ["lectures", "projects"],
        description:
            "Как хранить данные так, чтобы их было удобно искать и нельзя было испортить. Реляционная модель, SQL, проектирование схем, транзакции и индексы. Итог курса — командный проект с собственной базой данных.",
        program: [
            "1. Реляционная модель данных и нормальные формы",
            "2. SQL: выборки, соединения, группировка, подзапросы",
            "3. Проектирование схемы: ER-диаграммы, ключи, связи",
            "4. Индексы и план выполнения запроса",
            "5. Транзакции, уровни изоляции, блокировки",
            "6. Защита командного проекта"
        ].join("\n")
    },
    {
        title: "Алгоритмы и структуры данных",
        teacher: "i.ivanov@campus.ru",
        faculty: "it",
        semester: "spring-2026",
        hours: 216,
        formats: ["lectures", "seminars"],
        description:
            "Базовый курс для всех, кто пишет код: оценка сложности, сортировки, деревья, графы и динамическое программирование. Каждую неделю — контест с автоматической проверкой решений.",
        program: [
            "1. Асимптотика и оценка сложности алгоритмов",
            "2. Сортировки и бинарный поиск",
            "3. Стеки, очереди, хеш-таблицы",
            "4. Деревья поиска и кучи",
            "5. Графы: обходы, кратчайшие пути, остовные деревья",
            "6. Динамическое программирование",
            "7. Итоговый экзамен: задачи на компьютере"
        ].join("\n")
    },
    {
        title: "Машинное обучение",
        teacher: "a.petrova@campus.ru",
        faculty: "it",
        semester: "autumn-2026",
        hours: 216,
        formats: ["lectures", "seminars"],
        description:
            "Классические методы машинного обучения от линейной регрессии до градиентного бустинга. Много математики на лекциях и много практики на Python на семинарах.",
        program: [
            "1. Постановка задач обучения с учителем, метрики качества",
            "2. Линейная и логистическая регрессия, регуляризация",
            "3. Деревья решений и случайный лес",
            "4. Градиентный бустинг",
            "5. Кластеризация и понижение размерности",
            "6. Валидация моделей и борьба с переобучением"
        ].join("\n")
    },
    {
        title: "Анализ данных на Python",
        teacher: "a.petrova@campus.ru",
        faculty: "it",
        semester: "spring-2026",
        hours: 108,
        formats: ["seminars", "projects"],
        description:
            "Практический курс: pandas, визуализация и первичный анализ реальных датасетов. Подходит студентам любых направлений, достаточно базового Python.",
        program: [
            "1. Jupyter и основы pandas",
            "2. Очистка и подготовка данных",
            "3. Группировки и сводные таблицы",
            "4. Визуализация: matplotlib и seaborn",
            "5. Мини-исследование на открытых данных"
        ].join("\n")
    },
    {
        title: "Веб-разработка",
        teacher: "d.kovalev@campus.ru",
        faculty: "it",
        semester: "spring-2026",
        hours: 144,
        formats: ["seminars", "projects"],
        description:
            "От вёрстки до работающего приложения: HTML, CSS, JavaScript, React и REST API. Каждую неделю небольшой проект, в конце — собственное веб-приложение в команде.",
        program: [
            "1. HTML и семантическая вёрстка",
            "2. CSS: flexbox, grid, адаптивность",
            "3. JavaScript и работа с DOM",
            "4. React: компоненты, состояние, роутинг",
            "5. Node.js и REST API",
            "6. Командный проект и деплой"
        ].join("\n")
    },
    {
        title: "Мобильная разработка",
        teacher: "d.kovalev@campus.ru",
        faculty: "it",
        semester: "autumn-2026",
        hours: 144,
        formats: ["projects"],
        status: "pending",
        description:
            "Проектный курс: команда за семестр делает мобильное приложение на React Native — от прототипа до публикации тестовой сборки.",
        program: [
            "1. Основы React Native",
            "2. Навигация и работа с API",
            "3. Хранение данных на устройстве",
            "4. Тестирование и сборка приложения",
            "5. Демо-день"
        ].join("\n")
    },

    // ---------- Экономика ----------
    {
        title: "Микроэкономика",
        teacher: "e.sokolova@campus.ru",
        faculty: "econ",
        semester: "autumn-2026",
        hours: 180,
        formats: ["lectures", "seminars"],
        description:
            "Как принимают решения потребители и фирмы и как из этого складываются рынки. На семинарах разбираем задачи и реальные кейсы.",
        program: [
            "1. Спрос, предложение, рыночное равновесие",
            "2. Теория потребительского выбора",
            "3. Производство и издержки фирмы",
            "4. Совершенная конкуренция и монополия",
            "5. Олигополия и элементы теории игр",
            "6. Провалы рынка и роль государства"
        ].join("\n")
    },
    {
        title: "Маркетинговые исследования",
        teacher: "e.sokolova@campus.ru",
        faculty: "econ",
        semester: "autumn-2026",
        hours: 108,
        formats: ["seminars", "projects"],
        description:
            "Опросы, интервью, фокус-группы и анализ данных о потребителях. Команды проводят исследование по заказу реальной компании.",
        program: [
            "1. Цели и дизайн исследования",
            "2. Качественные методы: интервью, фокус-группы",
            "3. Анкеты и выборка",
            "4. Анализ результатов опроса",
            "5. Презентация отчёта заказчику"
        ].join("\n")
    },
    {
        title: "Финансовый анализ",
        teacher: "p.morozov@campus.ru",
        faculty: "econ",
        semester: "spring-2026",
        hours: 144,
        formats: ["seminars", "projects"],
        description:
            "Чтение финансовой отчётности, коэффициентный анализ и оценка инвестиционных проектов. Все расчёты — в Excel на данных настоящих компаний.",
        program: [
            "1. Бухгалтерский баланс и отчёт о прибылях",
            "2. Коэффициенты ликвидности, рентабельности, долговой нагрузки",
            "3. Денежные потоки",
            "4. NPV, IRR и оценка проектов",
            "5. Итоговый кейс: анализ публичной компании"
        ].join("\n")
    },
    {
        title: "Поведенческая экономика",
        teacher: "p.morozov@campus.ru",
        faculty: "econ",
        semester: "autumn-2026",
        hours: 108,
        formats: ["lectures"],
        status: "rejected",
        rejectionReason: "Добавьте программу курса по темам и опишите формат итоговой аттестации.",
        description: "Почему люди принимают нерациональные решения и как это учитывать в экономике.",
        program: null
    },

    // ---------- Гуманитарный ----------
    {
        title: "История науки",
        teacher: "p.sidorov@campus.ru",
        faculty: "hum",
        semester: "autumn-2026",
        hours: 108,
        formats: ["lectures", "seminars"],
        description:
            "Как менялись научные картины мира от Античности до XX века. На семинарах — дискуссии и разбор первоисточников, итог — эссе.",
        program: [
            "1. Наука в Античности",
            "2. Средневековые университеты",
            "3. Научная революция XVI–XVII веков",
            "4. Наука XIX века: эволюция и электричество",
            "5. Теория относительности и квантовая механика",
            "6. Эссе и его защита"
        ].join("\n")
    },
    {
        title: "Философия",
        teacher: "p.sidorov@campus.ru",
        faculty: "hum",
        semester: "spring-2026",
        hours: 108,
        formats: ["lectures"],
        description:
            "Ключевые философские вопросы и школы: от Платона до экзистенциализма. Чтение первоисточников и устный экзамен.",
        program: [
            "1. Что такое философия и зачем она нужна",
            "2. Античная философия",
            "3. Философия Нового времени",
            "4. Немецкая классическая философия",
            "5. Философия XX века"
        ].join("\n")
    },
    {
        title: "Академическое письмо",
        teacher: "n.fedorova@campus.ru",
        faculty: "hum",
        semester: "spring-2026",
        hours: 108,
        formats: ["seminars"],
        description:
            "Учимся писать научные тексты: структура статьи, аргументация, цитирование, работа с источниками. За семестр каждый пишет и редактирует собственную статью.",
        program: [
            "1. Жанры академических текстов",
            "2. Структура статьи и аннотация",
            "3. Аргументация и логика текста",
            "4. Источники, цитирование, плагиат",
            "5. Рецензирование и редактура"
        ].join("\n")
    },
    {
        title: "Публичные выступления",
        teacher: "n.fedorova@campus.ru",
        faculty: "hum",
        semester: "autumn-2026",
        hours: 72,
        formats: ["seminars", "projects"],
        status: "draft",
        description: "Практикум по подготовке и проведению выступлений: структура речи, работа с аудиторией и волнением.",
        program: null
    },

    // ---------- Естественные науки ----------
    {
        title: "Физика для инженеров",
        teacher: "o.lebedeva@campus.ru",
        faculty: "sci",
        semester: "autumn-2026",
        hours: 180,
        formats: ["lectures", "seminars"],
        description:
            "Механика, электричество и магнетизм с упором на инженерные задачи. Лабораторные работы каждые две недели.",
        program: [
            "1. Кинематика и динамика",
            "2. Законы сохранения",
            "3. Колебания и волны",
            "4. Электростатика и постоянный ток",
            "5. Магнитное поле и электромагнитная индукция",
            "6. Лабораторный практикум"
        ].join("\n")
    },
    {
        title: "Экология и устойчивое развитие",
        teacher: "o.lebedeva@campus.ru",
        faculty: "sci",
        semester: "spring-2026",
        hours: 108,
        formats: ["lectures", "projects"],
        description:
            "Экосистемы, климат и циркулярная экономика. Команды готовят проект по снижению углеродного следа кампуса.",
        program: [
            "1. Экосистемы и биоразнообразие",
            "2. Изменение климата: причины и последствия",
            "3. Ресурсы и отходы, циркулярная экономика",
            "4. Углеродный след и как его считать",
            "5. Защита командного проекта"
        ].join("\n")
    },
    {
        title: "Биоинформатика",
        teacher: "o.lebedeva@campus.ru",
        faculty: "sci",
        semester: "autumn-2026",
        hours: 144,
        formats: ["lectures", "projects"],
        status: "pending",
        description:
            "На стыке биологии и программирования: анализ последовательностей ДНК и белков, работа с биологическими базами данных.",
        program: [
            "1. Основы молекулярной биологии",
            "2. Выравнивание последовательностей",
            "3. Биологические базы данных",
            "4. Филогенетический анализ",
            "5. Мини-проект на Python"
        ].join("\n")
    }
]

module.exports = { DEMO_PASSWORD, faculties, semesters, teachers, students, courses }

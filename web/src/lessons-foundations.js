export const foundations = [
  {
    "id": "01",
    "title": "Что такое бэкенд: клиент, сервер, API",
    "topic": "HTTP",
    "file": "api/shop/lab/routes.py",
    "intro": "Витрина спрашивает, какие части системы участвуют в запросе.",
    "theory": [
      "React работает в браузере и отправляет запрос. FastAPI принимает его и решает, какие данные вернуть. PostgreSQL хранит игры и заказы.",
      "HTTP/JSON — публичный договор между интерфейсом и сервером: путь, метод и форма сообщения. Браузер общается с FastAPI, а FastAPI работает с БД."
    ],
    "code": "GET /api/lab/info",
    "tasks": [
      "Найдите info() и TODO 01.",
      "Сохраните поля client и api. Добавьте server со значением FastAPI.",
      "Сравните ответ со схемой клиент → сервер → PostgreSQL."
    ],
    "hint": "Здесь достаточно добавить ключ в словарь.",
    "question": "Кто соединяется с PostgreSQL?",
    "options": [
      "FastAPI",
      "React в браузере",
      "Swagger UI напрямую"
    ],
    "correct": 0,
    "explanation": "Подключение с учётными данными открывает сервер.",
    "doc": "https://developer.mozilla.org/ru/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview",
    "practice": "api"
  },
  {
    "id": "02",
    "title": "Установка FastAPI и первый endpoint",
    "topic": "FastAPI",
    "file": "api/shop/lab/routes.py",
    "intro": "Соберём маленькую проверку связи для магазина.",
    "theory": [
      "FastAPI и Uvicorn установлены из api/requirements.txt при сборке образа. FastAPI описывает приложение и маршруты, Uvicorn принимает HTTP-запросы и вызывает ASGI-приложение.",
      "Декоратор @router.get связывает GET и путь с функцией. Префикс /api/lab добавляется при подключении роутера, а словарь автоматически превращается в JSON."
    ],
    "code": "docker compose exec api python -m pip show fastapi",
    "tasks": [
      "Проверьте установку командой выше. Вне Docker соответствующая команда установки — python -m pip install -r api/requirements.txt.",
      "Подключите ping() как GET /ping на router. Из обработчика верните ровно {\"status\": \"ok\"}.",
      "Вызовите GET /api/lab/ping из Swagger UI."
    ],
    "hint": "Префикс /api/lab уже задан роутеру. В декораторе укажите только /ping.",
    "question": "Что запускает ASGI-приложение и слушает порт?",
    "options": [
      "Pydantic",
      "Uvicorn",
      "PostgreSQL"
    ],
    "correct": 1,
    "explanation": "Uvicorn передаёт запрос приложению FastAPI.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/first-steps/",
    "practice": "api"
  },
  {
    "id": "03",
    "title": "Path- и query-параметры",
    "topic": "FastAPI",
    "file": "api/shop/catalog.py",
    "intro": "В карточке ID берётся из пути. В каталоге покупатель передаёт жанр, бюджет и порядок сортировки.",
    "theory": [
      "В /api/games/{game_id} часть пути обозначает одну игру. Параметры после ? меняют выборку. Аннотации и Query задают типы, значения по умолчанию и ограничения.",
      "SQL-параметры передают значения отдельно от запроса. В ORDER BY выбирайте между двумя фиксированными выражениями. Второй ключ id задаёт порядок при одинаковой цене."
    ],
    "code": "GET /api/games?genre=Гонки&max_price=990&sort=price_asc",
    "tasks": [
      "Добавьте предикат price_rub <= %s при заданном max_price и значение в params.",
      "Для price_asc сортируйте по price_rub, затем id. Сохраните сортировку по id по умолчанию.",
      "Отправьте запрос из примера. Должен остаться Gran Turismo 4."
    ],
    "hint": "Условия уже объединяются через AND. Используйте существующий список params.",
    "question": "Какой параметр определяет одну конкретную игру?",
    "options": [
      "genre",
      "game_id в пути",
      "max_price"
    ],
    "correct": 1,
    "explanation": "ID в пути указывает на отдельный ресурс.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/query-params/",
    "practice": "shop"
  },
  {
    "id": "04",
    "title": "Pydantic и тело запроса",
    "topic": "Pydantic",
    "file": "api/shop/models.py",
    "intro": "Толя принимает заказы на количество от одного до пяти дисков одной игры.",
    "theory": [
      "FastAPI разбирает JSON в OrderInput. Field описывает границы и помещает их в OpenAPI. Некорректное тело даёт 422 до выполнения функции.",
      "Валидное количество проверяется отдельно от наличия товара. Недостаточный остаток — конфликт с текущим состоянием магазина и ответ 409."
    ],
    "code": "{\"game_id\": 1, \"buyer\": \"Толя\", \"quantity\": 6}",
    "tasks": [
      "Ограничьте quantity диапазоном от 1 до 5 включительно в модели.",
      "Уберите из api/shop/orders.py ручную ветку quantity <= 0, которую теперь дублирует модель.",
      "Отправьте пример в POST /api/orders. Убедитесь, что 422 указывает на body.quantity."
    ],
    "hint": "Включительные границы — параметры ge и le у Field.",
    "question": "При каком запросе нужна ошибка 409?",
    "options": [
      "Количество 0",
      "Некорректный JSON",
      "Количество валидно, остатка не хватает"
    ],
    "correct": 2,
    "explanation": "Запрос корректен по схеме, но выполнить его нельзя из-за текущих данных.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/body/",
    "practice": "api"
  },
  {
    "id": "05",
    "title": "HTTP под капотом: метод, статус, заголовки",
    "topic": "HTTP",
    "file": "api/shop/lab/routes.py",
    "intro": "Разберите HTTP-сообщение и добавьте настройки кэширования для учебного ответа.",
    "theory": [
      "Метод описывает действие, например чтение через GET. Сервер отвечает статусом и заголовками. Если такой маршрут поддерживает GET, но не POST, ответ на POST будет 405.",
      "Content-Type объясняет, как читать тело ответа. Cache-Control управляет промежуточным и браузерным кэшем. Директива no-store запрещает хранить этот ответ."
    ],
    "code": "curl -i http://localhost:8000/api/lab/headers",
    "tasks": [
      "В headers() добавьте заголовок Cache-Control: no-store.",
      "Сохраните тело {\"revision\": 1}.",
      "Сравните вывод curl -i для GET и curl -i -X POST для того же URL."
    ],
    "hint": "У FastAPI Response доступен словарь response.headers.",
    "question": "Где клиент узнаёт, что тело — JSON?",
    "options": [
      "В Content-Type",
      "В имени обработчика",
      "В статусе 200"
    ],
    "correct": 0,
    "explanation": "Media type находится в заголовке Content-Type.",
    "doc": "https://developer.mozilla.org/ru/docs/Web/HTTP/Guides/Messages",
    "practice": "api"
  },
  {
    "id": "06",
    "title": "Response-модели и статус-коды",
    "topic": "FastAPI",
    "file": "api/shop/catalog.py",
    "intro": "Исправьте контракт карточки отсутствующей игры.",
    "theory": [
      "response_model задаёт форму успешного ответа, фильтрует данные и описывает их в OpenAPI. Отдельные выходные модели позволяют не раскрывать внутренние поля, например хеш пароля.",
      "200 сообщает об успешном чтении, 201 — о создании, 204 — об успехе без тела. Правильный ID отсутствующего ресурса должен давать 404."
    ],
    "code": "GET /api/games/99999",
    "tasks": [
      "В get_game поднимите HTTPException(404, ...) при отсутствии строки. Используйте detail «Игра не найдена».",
      "Укажите Game как модель успешного ответа.",
      "Проверьте реальную карточку и ссылку на отсутствующий диск в каталоге."
    ],
    "hint": "fetchone() возвращает None для пустого результата.",
    "question": "Где описать поля успешного JSON-ответа?",
    "options": [
      "В response_model",
      "Только в локальном состоянии React",
      "В статусе 404"
    ],
    "correct": 0,
    "explanation": "FastAPI использует response_model для сериализации и OpenAPI.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/response-model/",
    "practice": "shop"
  },
  {
    "id": "07",
    "title": "PostgreSQL в Docker",
    "topic": "PostgreSQL",
    "file": "api/shop/lab/routes.py",
    "intro": "Посмотрите, к какой базе реально подключился контейнер FastAPI.",
    "theory": [
      "Compose запускает PostgreSQL как сервис db. Бэкенд обращается к нему по DNS-имени db внутри сети Compose. Именованный том хранит данные после пересоздания контейнера.",
      "DATABASE_URL задаёт подключение. С помощью SHOW server_version и SELECT current_database() можно проверить сервер и текущую БД. pg_isready проверяет готовность принимать подключения."
    ],
    "code": "docker compose exec db psql -U disc -d disc_school -c 'SELECT current_database();'",
    "tasks": [
      "Посмотрите service db, healthcheck и том в compose.yaml.",
      "В database() добавьте поле database. Получите его через session.scalar и SELECT current_database().",
      "Сравните значения GET /api/lab/db и команды psql."
    ],
    "hint": "SQLAlchemy text() принимает текст SQL-выражения, scalar возвращает значение первой колонки.",
    "question": "Какой адрес PostgreSQL использует FastAPI внутри Compose?",
    "options": [
      "localhost",
      "Имя сервиса db",
      "IP браузера"
    ],
    "correct": 1,
    "explanation": "Сервисы Compose разрешают имена соседей в общей сети.",
    "doc": "https://habr.com/ru/articles/823816/",
    "practice": "api"
  },
  {
    "id": "08",
    "title": "SQLAlchemy: модель, engine, session",
    "topic": "SQLAlchemy",
    "file": "api/shop/lab/repositories.py",
    "intro": "Покажите реальное число позиций учебного инвентаря.",
    "theory": [
      "LabDisk отображает Python-атрибуты на колонки PostgreSQL. Engine управляет подключениями и их пулом. Session ведёт работу ORM в рамках единицы работы.",
      "select строит выражение, а Session выполняет его. Для агрегата COUNT используйте SELECT и получите одно значение методом scalar."
    ],
    "code": "GET /api/lab/disks/count",
    "tasks": [
      "Откройте lab/models.py и lab/database.py, найдите модель и фабрику engine.",
      "Реализуйте count_disks с помощью select, func.count() и select_from(LabDisk).",
      "Добавьте диск через POST /api/lab/disks и проверьте, что count вырос."
    ],
    "hint": "Для пустой таблицы SQL COUNT возвращает 0.",
    "question": "Что выполняет запрос ORM в обработчике?",
    "options": [
      "Тип Mapped",
      "Браузер",
      "Session"
    ],
    "correct": 2,
    "explanation": "Session использует подключение Engine для работы с БД.",
    "doc": "https://pythondoc.ru/docs/sqlalchemy/2.0/orm/session_basics/",
    "practice": "api"
  },
  {
    "id": "09",
    "title": "Сессия БД через Depends",
    "topic": "FastAPI",
    "file": "api/shop/lab/routes.py",
    "intro": "Подключите диагностику к той же зависимости, что использует CRUD.",
    "theory": [
      "Depends связывает обработчик и get_session. Зависимость с yield открывает сессию на время запроса и закрывает её после выхода из контекстного менеджера.",
      "В тесте dependency_overrides заменяет get_session. Если обработчик открывает Session напрямую, переопределение до него не дойдёт."
    ],
    "code": "GET /api/lab/session",
    "tasks": [
      "Добавьте к session_status параметр session: Db. Изучите, как Db использует Annotated и Depends.",
      "Выполните SELECT 1 и верните ready: true только при результате 1.",
      "Запустите тест. Он также подменяет зависимость и проверяет false."
    ],
    "hint": "Переиспользуйте существующий alias Db и session.scalar(text(...)).",
    "question": "Что позволяет тесту подставить другую сессию?",
    "options": [
      "app.dependency_overrides",
      "response_model",
      "Публикация порта"
    ],
    "correct": 0,
    "explanation": "FastAPI ищет замену по объекту исходной функции-зависимости.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/dependencies/dependencies-with-yield/",
    "practice": "api"
  },
  {
    "id": "10",
    "title": "CRUD-эндпоинты с реальной БД",
    "topic": "SQLAlchemy",
    "file": "api/shop/lab/routes.py",
    "intro": "Доработайте изменение записей учебного склада Толи.",
    "theory": [
      "CRUD соответствует созданию, чтению, обновлению и удалению. PUT заменяет данные ресурса по известному ID. В проекте DiskInput задаёт все изменяемые поля.",
      "После изменения ORM-объекта commit сохраняет изменения. refresh загружает состояние строки. Между запросами PostgreSQL хранит новые данные."
    ],
    "code": "{\"title\": \"Gran Turismo 4 – Platinum\", \"price_rub\": 990, \"stock\": 1}",
    "tasks": [
      "Создайте запись в POST /api/lab/disks и запомните id.",
      "Реализуйте replace_disk: найдите запись, обновите три поля, выполните commit и refresh.",
      "Проверьте GET, PUT, DELETE и 404 для удалённой записи."
    ],
    "hint": "disk_or_404 уже возвращает модель или поднимает HTTPException.",
    "question": "Какой запрос проверит, что изменение записалось между вызовами?",
    "options": [
      "GET после PUT",
      "Повторная валидация тела PUT",
      "Только чтение OpenAPI"
    ],
    "correct": 0,
    "explanation": "Новый запрос открывает сессию и читает сохранённую строку.",
    "doc": "https://pythondoc.ru/docs/sqlalchemy/2.0/orm/session_basics/#committing",
    "practice": "api"
  },
  {
    "id": "11",
    "title": "Alembic: миграции схемы",
    "topic": "PostgreSQL",
    "file": "api/migrations/versions/0002_disk_title_index.py",
    "intro": "Добавьте индекс по названию без пересоздания таблицы.",
    "theory": [
      "Миграция — версия изменения схемы с upgrade и downgrade. Alembic хранит применённую ревизию и запускает недостающие шаги в указанном порядке.",
      "0001 создаёт таблицы. 0002 оставлена пустой для упражнения, но уже отмечена при старте приложения. После правки откатите только её и снова обновите до head."
    ],
    "code": "docker compose exec api alembic downgrade 0001 && docker compose exec api alembic upgrade head",
    "tasks": [
      "В upgrade вызовите op.create_index для ix_lab_disks_title на lab_disks.title.",
      "Оставьте обратное удаление индекса в downgrade. Таблицы и записи должны сохраниться.",
      "Выполните команды из примера. В PostgreSQL проверьте индекс через \\d lab_disks."
    ],
    "hint": "op.create_index принимает имя индекса, имя таблицы и список колонок.",
    "question": "Зачем нужен downgrade у ревизии?",
    "options": [
      "Чтобы выполнять HTTP-запрос",
      "Чтобы отменить изменение схемы",
      "Чтобы очистить все данные"
    ],
    "correct": 1,
    "explanation": "Откат этой ревизии удаляет только добавленный индекс.",
    "doc": "https://habr.com/ru/companies/yandex/articles/511892/",
    "practice": "api"
  },
  {
    "id": "12",
    "title": "Раздутый main.py: выносим роуты",
    "topic": "FastAPI",
    "file": "api/shop/lab/routes.py",
    "intro": "Перенесите маршрут из главного модуля в роутер лаборатории.",
    "theory": [
      "В main.py удобно оставить сборку приложения, lifespan и подключение роутеров. APIRouter даёт тематическим модулям собственные маршруты, теги и зависимости.",
      "include_router добавляет маршруты к родительскому роутеру. При вложенном подключении путь дочернего модуля получает префикс родителя."
    ],
    "code": "GET /api/lab/about",
    "tasks": [
      "Найдите lab_about в api/shop/main.py. В api/shop/lab/about.py уже подготовлен одноимённый маршрут с префиксом из родительского роутера.",
      "Удалите lab_about вместе с декоратором из main.py. Импортируйте роутер из about.py и подключите его в lab/routes.py.",
      "Проверьте /api/lab/about в Swagger. Регистрация обработчика должна оставаться в about.py."
    ],
    "hint": "Назовите импорт about_router, чтобы отличать его от текущего router.",
    "question": "Какой путь получится из префикса /api/lab и маршрута /about?",
    "options": [
      "/about",
      "/api/about",
      "/api/lab/about"
    ],
    "correct": 2,
    "explanation": "При подключении FastAPI складывает префикс и путь.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/bigger-applications/",
    "practice": "api"
  },
  {
    "id": "13",
    "title": "Слои: routes/services/repositories",
    "topic": "Архитектура",
    "file": "api/shop/lab/services.py",
    "intro": "Доработайте расчёт предварительной суммы заказа.",
    "theory": [
      "Роутер принимает HTTP-запрос, вызывает сервис и переводит ошибку в статус. Сервис содержит правило расчёта. Репозиторий обращается к данным через Session.",
      "Разделение упрощает проверку: правила цены можно тестировать отдельно от HTTP, а сквозной тест проверяет взаимодействие всех трёх слоёв."
    ],
    "code": "GET /api/lab/quote/1?quantity=3",
    "tasks": [
      "Создайте позицию в учебном инвентаре, запомните id и цену.",
      "В quote_order рассчитайте общую стоимость всех экземпляров по серверной цене.",
      "Сохраните DiskMissing для отсутствующей позиции. Проверьте комбинацию цены 990 и количества 3."
    ],
    "hint": "Значение disk.price_rub получается из get_disk, quantity уже передан сервису.",
    "question": "В каком слое держать правило расчёта суммы?",
    "options": [
      "Сервис",
      "Репозиторий",
      "CORS middleware"
    ],
    "correct": 0,
    "explanation": "Сервис отвечает за правила предметной области.",
    "doc": "https://habr.com/ru/articles/983254/",
    "practice": "api"
  },
  {
    "id": "14",
    "title": "Конфигурация через pydantic-settings",
    "topic": "Настройки",
    "file": "api/shop/lab/routes.py",
    "intro": "Научите один и тот же код читать название магазина из окружения.",
    "theory": [
      "BaseSettings заполняет типизированные поля при запуске. Для shop_label переменная окружения называется SHOP_LABEL. Ошибка в формате настройки видна при создании Settings.",
      "Пароль БД берётся из DATABASE_URL, ключ токена из JWT_SECRET. SecretStr маскирует секрет при выводе модели. Публичный эндпоинт возвращает только разрешённое поле."
    ],
    "code": "GET /api/lab/settings",
    "tasks": [
      "В public_settings используйте settings.shop_label.",
      "Посмотрите, где Settings создаётся в lifespan и как объект попадает через Depends в обработчик.",
      "Запустите тест с monkeypatch.setenv и проверьте, что имя берётся из окружения."
    ],
    "hint": "Не сериализуйте объект Settings целиком. Нужна одна строка shop_label.",
    "question": "Где установить другое название без изменений кода?",
    "options": [
      "В SHOP_LABEL",
      "В колонке LabDisk.title",
      "В типе ответа"
    ],
    "correct": 0,
    "explanation": "pydantic-settings читает переменную окружения при создании объекта.",
    "doc": "https://fastapi.tiangolo.com/ru/advanced/settings/",
    "practice": "api"
  }
];

export const advanced = [
  {
    "id": "15",
    "title": "Хеширование паролей: bcrypt",
    "topic": "Безопасность",
    "file": "api/shop/lab/security.py",
    "intro": "Проверьте, что bcrypt использует заданную вычислительную стоимость и новую соль для каждого пароля.",
    "theory": [
      "Пароль хранится в виде хеша. bcrypt добавляет случайную соль и кодирует в хеше параметры, нужные для проверки. Два вызова для одного пароля должны давать разные строки.",
      "Раунды задают стоимость хеширования. Рабочее значение по умолчанию здесь 12, низкое значение 4 применяется только в быстром тесте. Вход ограничен 72 байтами UTF-8, чтобы пароль не усекался."
    ],
    "code": "bcrypt.gensalt(rounds=rounds)",
    "tasks": [
      "Передайте параметр rounds функции gensalt.",
      "Оставьте значение по умолчанию 12 и сохраните текущую проверку пароля.",
      "Запустите тест, который сравнивает хеши и проверяет верный и неверный пароль."
    ],
    "hint": "У параметра функции и параметра gensalt совпадает имя.",
    "question": "Зачем нужна уникальная соль?",
    "options": [
      "Чтобы скрыть URL базы",
      "Чтобы одинаковые пароли имели разные хеши",
      "Чтобы проверить JWT"
    ],
    "correct": 1,
    "explanation": "Соль различается для каждой записи и сохраняется внутри bcrypt-хеша.",
    "doc": "https://habr.com/ru/articles/1051800/",
    "practice": "api"
  },
  {
    "id": "16",
    "title": "Регистрация и логин",
    "topic": "FastAPI",
    "file": "api/shop/lab/routes.py",
    "intro": "Уточните поведение при регистрации уже занятого имени.",
    "theory": [
      "При регистрации сервер проверяет тело, хеширует пароль и записывает учётную запись. Уникальный индекс в PostgreSQL защищает имя даже при параллельных регистрациях.",
      "Логин сравнивает пароль с сохранённым хешем и при успехе возвращает токен. При неверных данных ответ 401 одинаков для неизвестного имени и неверного пароля."
    ],
    "code": "POST /api/lab/register → POST /api/lab/login",
    "tasks": [
      "Зарегистрируйте тестового пользователя с именем tolyashop и паролем «training password only».",
      "Верните 409 для повторной регистрации. Оставьте rollback после IntegrityError.",
      "Войдите с тем же именем и проверьте, что регистрация никогда не возвращает password_hash."
    ],
    "hint": "Ищите except IntegrityError внутри register().",
    "question": "Что гарантирует уникальность при двух одновременных запросах?",
    "options": [
      "Предварительный SELECT без ограничения",
      "UNIQUE в PostgreSQL",
      "Поле token_type"
    ],
    "correct": 1,
    "explanation": "Ограничение БД проверяется при записи и защищает от гонки.",
    "doc": "https://postgrespro.ru/docs/postgresql/16/ddl-constraints#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS",
    "practice": "api"
  },
  {
    "id": "17",
    "title": "JWT-токены",
    "topic": "Безопасность",
    "file": "api/shop/lab/security.py",
    "intro": "Используйте настроенный срок жизни токена.",
    "theory": [
      "JWT состоит из заголовка, утверждений и подписи. В sub хранится ID пользователя, iat фиксирует время выдачи, exp ограничивает срок. Содержимое можно прочитать, поэтому личные секреты в payload не помещают.",
      "Сервер подписывает токен и при чтении проверяет подпись, срок и обязательные утверждения. PyJWT получает допустимый алгоритм из кода приложения."
    ],
    "code": "Authorization: Bearer <access_token>",
    "tasks": [
      "Найдите вычисление expires в issue_token.",
      "Используйте settings.token_minutes вместо литерала 15.",
      "Запустите тест. Он проверяет подпись и ровно 300 секунд между iat и exp при настройке 5 минут."
    ],
    "hint": "datetime с часовым поясом UTC уже создан. Подставьте параметр в timedelta.",
    "question": "Куда положить пароль пользователя в JWT?",
    "options": [
      "В sub",
      "В заголовок",
      "Пароль не хранится в JWT"
    ],
    "correct": 2,
    "explanation": "JWT подписан, но содержимое обычного токена легко прочитать.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/security/oauth2-jwt/",
    "practice": "api"
  },
  {
    "id": "18",
    "title": "Защита эндпоинтов через Depends",
    "topic": "Безопасность",
    "file": "api/shop/lab/routes.py",
    "intro": "Доработайте контракт защищённого профиля.",
    "theory": [
      "HTTPBearer извлекает токен из Authorization. Зависимость current_user проверяет подпись и загружает пользователя. Только после этого вызывается me().",
      "При отсутствующем или неверном токене API отвечает 401. WWW-Authenticate сообщает клиенту, что сервер принимает схему Bearer. 403 применяется, когда аутентифицированному пользователю запрещено действие."
    ],
    "code": "GET /api/lab/me",
    "tasks": [
      "Добавьте в me() параметр user с зависимостью current_user. Верните user, сохранив response_model=UserOutput.",
      "Добавьте WWW-Authenticate: Bearer в auth_error().",
      "Вызовите /api/lab/me без токена и после входа. Убедитесь, что во втором случае возвращается только публичный профиль."
    ],
    "hint": "Для user используйте Annotated[LabUser, Depends(current_user)]. HTTPException принимает словарь headers.",
    "question": "В какой момент выполняется current_user?",
    "options": [
      "При сборке образа",
      "До вызова me()",
      "После отправки ответа"
    ],
    "correct": 1,
    "explanation": "FastAPI разрешает зависимости до вызова функции маршрута.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/security/first-steps/",
    "practice": "api"
  },
  {
    "id": "19",
    "title": "Первый тест на pytest и TestClient",
    "topic": "Тестирование",
    "file": "api/tests/learner_checks.py",
    "intro": "Напишите проверку полезного ответа, которую сломает регрессия.",
    "theory": [
      "TestClient отправляет запрос ASGI-приложению без сетевого сервера. В pytest обычный assert даёт отчёт о фактическом и ожидаемом значении.",
      "Успешный статус сам по себе мало говорит о полезном ответе. Тест должен проверить JSON. Здесь две мини-версии приложения имитируют исправный и сломанный обработчик."
    ],
    "code": "response = client.get('/api/lab/ping')",
    "tasks": [
      "Откройте assert_ping и сохраните проверку 200.",
      "Добавьте проверку поля status в JSON. Оно должно равняться строке ok.",
      "Запустите тест. Он вызывает вашу проверку и на корректном, и на неправильном ответе."
    ],
    "hint": "TestClient возвращает объект с методом response.json().",
    "question": "Почему недостаточно проверить только статус 200?",
    "options": [
      "Успешный ответ может содержать неверные данные",
      "200 используется только браузером",
      "pytest читает только заголовки"
    ],
    "correct": 0,
    "explanation": "Статус и содержание ответа — разные части контракта.",
    "doc": "https://fastapi.tiangolo.com/ru/tutorial/testing/",
    "practice": "api"
  },
  {
    "id": "20",
    "title": "Тестовая БД с откатом транзакции",
    "topic": "Тестирование",
    "file": "api/tests/learner_checks.py",
    "intro": "Изолируйте запросы теста через транзакцию PostgreSQL.",
    "theory": [
      "Тест открывает Connection и внешнюю транзакцию. Через dependency_overrides обработчики получают Session с тем же Connection. В конце тест делает rollback внешней транзакции.",
      "join_transaction_mode=create_savepoint даёт каждой Session SAVEPOINT. Внутренний commit сохраняет изменения только внутри внешней транзакции, а внутренний rollback откатывает только работу этой сессии."
    ],
    "code": "Session(bind=connection, join_transaction_mode=...)",
    "tasks": [
      "В transactional_session настройте соединение через SAVEPOINT.",
      "Проследите тест 20: POST вызывает commit, а следующая Session делает rollback после другой записи.",
      "После завершения внешней транзакции убедитесь, что записей в БД нет."
    ],
    "hint": "Параметр join_transaction_mode назван в теории. Внешний rollback остаётся в тестовой фикстуре.",
    "question": "Что убирает результат даже после commit внутри эндпоинта?",
    "options": [
      "Очистка localStorage",
      "Откат внешней транзакции",
      "Переименование контейнера"
    ],
    "correct": 1,
    "explanation": "Внутренний commit завершает SAVEPOINT, а внешняя транзакция остаётся под контролем теста.",
    "doc": "https://pythondoc.ru/docs/sqlalchemy/2.0/orm/session_transaction/#joining-a-session-into-an-external-transaction-such-as-for-test-suites",
    "practice": "api"
  },
  {
    "id": "21",
    "title": "Что и как тестировать в API",
    "topic": "Тестирование",
    "file": "api/tests/learner_checks.py",
    "intro": "Расширьте набор негативных сценариев для учебного склада.",
    "theory": [
      "Проверяйте границы контракта: статус, тело, заголовки, состояние PostgreSQL и поведение при ошибке. Выберите данные, которые воспроизводят конкретную ветку.",
      "Параметризация pytest запускает один сценарий с разными входами. Для каждого сбоя проверяйте, какое поле названо в detail, и что при этом не появилась запись."
    ],
    "code": "POST /api/lab/disks → 422",
    "tasks": [
      "В INVALID_DISKS уже есть пример с price_rub = 0.",
      "Добавьте отдельные payload для пустого title и отрицательного stock. У каждого должно быть только одно ошибочное поле.",
      "Запустите матрицу тестов. Она проверяет 422, путь поля в detail и пустую таблицу после ошибки."
    ],
    "hint": "Элемент INVALID_DISKS — пара (payload, имя_поля). Остальные поля в payload оставьте валидными.",
    "question": "Что ещё проверить после невалидного POST кроме статуса?",
    "options": [
      "Состояние БД и путь к полю ошибки",
      "Только число строк в Dockerfile",
      "Порт React"
    ],
    "correct": 0,
    "explanation": "Неожиданное изменение БД — регрессия даже при правильно выбранном статусе.",
    "doc": "https://pytest-docs-ru.readthedocs.io/ru/latest/parametrize.html",
    "practice": "api"
  },
  {
    "id": "22",
    "title": "Что такое контейнер",
    "topic": "Docker",
    "file": "compose.yaml",
    "intro": "Запустите контейнер API и найдите его по метке.",
    "theory": [
      "Образ содержит файловую систему и описание запуска. Контейнер — запущенный или остановленный экземпляр образа с собственным процессом и окружением.",
      "Метку можно добавить на уровне сервиса Compose, чтобы увидеть её в docker inspect или отфильтровать контейнеры. Изменение конфигурации требует пересоздания контейнера."
    ],
    "code": "docker compose up -d api",
    "tasks": [
      "В services.api.labels задайте org.disc-school.component: fastapi.",
      "Выполните команду выше и сравните docker compose images с docker compose ps.",
      "Проверьте фильтр docker ps --filter label=org.disc-school.component=fastapi."
    ],
    "hint": "Метки можно описать словарём YAML.",
    "question": "Из чего создаётся контейнер?",
    "options": [
      "Из строки JSON API",
      "Из образа",
      "Из браузерной вкладки"
    ],
    "correct": 1,
    "explanation": "Один образ может стать основой нескольких отдельных контейнеров.",
    "doc": "https://selectel.ru/blog/what-is-docker/",
    "practice": "terminal"
  },
  {
    "id": "23",
    "title": "Dockerfile для FastAPI",
    "topic": "Docker",
    "file": "api/Dockerfile",
    "intro": "Добавьте описание порта в образ FastAPI.",
    "theory": [
      "FROM задаёт базовый образ; WORKDIR меняет рабочую папку; COPY переносит файлы. Если зависимости копируются раньше исходников, Docker может переиспользовать слой установки при изменении Python-кода.",
      "CMD запускает Uvicorn. EXPOSE документирует порт образа. Доступ к порту с хоста для этого проекта настраивается в compose.yaml через ports."
    ],
    "code": "docker compose build api",
    "tasks": [
      "Добавьте EXPOSE 8000 перед CMD.",
      "Пересоберите образ и сравните EXPOSE с портом, который задали Uvicorn.",
      "Проверьте docker image inspect для ID из docker compose images -q api."
    ],
    "hint": "EXPOSE не требует двоеточия и не меняет ports в Compose.",
    "question": "Что публикует порт контейнера на хосте?",
    "options": [
      "EXPOSE",
      "ports в Compose",
      "COPY"
    ],
    "correct": 1,
    "explanation": "EXPOSE — метаданные образа, а ports создаёт проброс.",
    "doc": "https://etl-kitchen-book.ru/data/containers/Docker/deep_dive/",
    "practice": "terminal"
  },
  {
    "id": "24",
    "title": "Docker Compose: запускаем весь стек",
    "topic": "Docker",
    "file": "compose.yaml",
    "intro": "Проверьте цепочку от React-прокси до PostgreSQL.",
    "theory": [
      "Compose соединяет db, api и web одной сетью. Состояние service_healthy помогает избежать гонки на старте. Проверка внутри web проходит через тот же прокси, что использует браузер.",
      "Healthcheck должен укладываться во время ожидания и завершаться ненулевым кодом при ошибке. В Node-образе доступен fetch. Успех — только HTTP-ответ с response.ok."
    ],
    "code": "http://127.0.0.1:5173/api/health",
    "tasks": [
      "Добавьте healthcheck с CMD, node и -e для сервиса web.",
      "Проверяйте URL из примера. Завершите процесс с кодом 1 при сетевой ошибке или response.ok === false.",
      "Задайте interval, timeout и retries. После docker compose up -d посмотрите docker compose ps."
    ],
    "hint": "fetch(...).then(...) обрабатывает статус, а .catch(...) — сетевые ошибки.",
    "question": "Какой результат должна дать проверка при ответе 503?",
    "options": [
      "Код 0",
      "Ненулевой код",
      "Любой код, достаточно тела"
    ],
    "correct": 1,
    "explanation": "Docker считает проверку успешной только при нулевом коде завершения.",
    "doc": "https://habr.com/ru/companies/ruvds/articles/1052844/",
    "practice": "terminal"
  },
  {
    "id": "25",
    "title": "Заказ и остатки в транзакции",
    "topic": "PostgreSQL",
    "file": "api/shop/orders.py",
    "intro": "Толя не должен дважды продать последний диск.",
    "theory": [
      "Списание остатка и запись заказа входят в одну транзакцию. Если INSERT завершается ошибкой, UPDATE в той же транзакции откатывается.",
      "SELECT … FOR UPDATE удерживает строку до конца транзакции. Вторая покупка ждёт, затем видит обновлённый остаток. При нехватке дисков сервер возвращает 409."
    ],
    "code": "POST /api/orders → 201 Created",
    "tasks": [
      "В TODO 25 добавьте параметризованный UPDATE перед INSERT.",
      "Уменьшайте stock на quantity только у выбранной игры.",
      "Запустите тесты списания, одновременной покупки и отката после сбоя INSERT."
    ],
    "hint": "UPDATE выполняется через тот же db внутри with db.transaction().",
    "question": "Что остаётся в базе после сбоя INSERT и отката?",
    "options": [
      "Уменьшенный остаток",
      "Записанный заказ",
      "Исходный остаток"
    ],
    "correct": 2,
    "explanation": "PostgreSQL отменяет все изменения той же транзакции.",
    "doc": "https://postgrespro.ru/docs/postgresql/16/explicit-locking#LOCKING-ROWS",
    "practice": "shop"
  },
  {
    "id": "26",
    "title": "React: оформляем заказ из витрины",
    "topic": "React",
    "file": "web/src/client.js",
    "intro": "Подключите готовую форму карточки к FastAPI.",
    "theory": [
      "Форма собирает имя и количество, а placeOrder формирует HTTP-запрос. Тест передаёт заглушку fetch, чтобы проверить метод, заголовки и JSON.",
      "request проверяет response.ok и показывает сообщение detail при ошибке. После 201 карточка выводит номер заказа и перечитывает остаток."
    ],
    "code": "POST /api/orders · Content-Type: application/json",
    "tasks": [
      "Реализуйте placeOrder через request с URL /api/orders и методом POST.",
      "Укажите Content-Type и JSON.stringify(order). Передайте fetcher третьим аргументом request.",
      "В карточке доступного диска оформите заказ, проверьте номер заказа и остаток."
    ],
    "hint": "Верните результат request, чтобы форма получила JSON заказа.",
    "question": "Как fetch сообщает про HTTP-ответ 409?",
    "options": [
      "Через response.status и response.ok",
      "Только через отклонение Promise",
      "Только через пустой JSON"
    ],
    "correct": 0,
    "explanation": "HTTP-ошибка сама не отклоняет Promise fetch.",
    "doc": "https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch",
    "practice": "shop"
  }
];

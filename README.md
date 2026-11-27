# Дисковая · Учебник FastAPI

Практический курс из 26 уроков. Толя продаёт подержанные игры для PS2. В каждом уроке есть теория, вопрос, правка в готовом проекте и проверка. В конце курса — техническое задание на отдельный магазин Xbox 360.

## Запуск в WSL или Linux

Нужен Docker с командой `docker compose`. В Docker Desktop для Windows включите интеграцию с дистрибутивом WSL. Если папка проекта уже есть, пропустите клонирование.

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/Nihaochingiz/fastapi-shop-school.git
cd fastapi-shop-school
docker compose up --build -d
docker compose ps
```

- [Учебник](http://localhost:5173/)
- [Магазин Толи](http://localhost:5173/#/shop)
- [Swagger UI](http://localhost:8000/docs)
- [ТЗ магазина Xbox 360](http://localhost:5173/#/final)

Если порты заняты, задайте другие: `WEB_PORT=5175 API_PORT=8005 docker compose up --build -d`. Swagger UI также доступен через прокси фронтенда по адресу `/docs`.

## Как проходить

1. Прочитайте теорию и ответьте на вопрос в браузере.
2. Найдите `TODO` по номеру урока. Запустите указанную в уроке команду теста, чтобы увидеть стартовое поведение.
3. Внесите правку, повторите тест и проверьте результат в Swagger UI, на витрине или в терминале. Изменения Python и React подхватываются через bind mount. После изменений Compose или Dockerfile пересоздайте или пересоберите сервис.
4. Отметьте урок. Отметки сохраняются в браузере. После урока 26 откройте итоговое ТЗ.

| Урок | Тема | Файл для практики |
| --- | --- | --- |
| 01 | Что такое бэкенд: клиент, сервер, API | `api/shop/lab/routes.py` |
| 02 | Установка FastAPI и первый endpoint | `api/shop/lab/routes.py` |
| 03 | Path- и query-параметры | `api/shop/catalog.py` |
| 04 | Pydantic и тело запроса | `api/shop/models.py` |
| 05 | HTTP под капотом: метод, статус, заголовки | `api/shop/lab/routes.py` |
| 06 | Response-модели и статус-коды | `api/shop/catalog.py` |
| 07 | PostgreSQL в Docker | `api/shop/lab/routes.py` |
| 08 | SQLAlchemy: модель, engine, session | `api/shop/lab/repositories.py` |
| 09 | Сессия БД через Depends | `api/shop/lab/routes.py` |
| 10 | CRUD-эндпоинты с реальной БД | `api/shop/lab/routes.py` |
| 11 | Alembic: миграции схемы | `api/migrations/versions/0002_disk_title_index.py` |
| 12 | Раздутый main.py: выносим роуты | `api/shop/lab/routes.py` |
| 13 | Слои: routes/services/repositories | `api/shop/lab/services.py` |
| 14 | Конфигурация через pydantic-settings | `api/shop/lab/routes.py` |
| 15 | Хеширование паролей: bcrypt | `api/shop/lab/security.py` |
| 16 | Регистрация и логин | `api/shop/lab/routes.py` |
| 17 | JWT-токены | `api/shop/lab/security.py` |
| 18 | Защита эндпоинтов через Depends | `api/shop/lab/routes.py` |
| 19 | Первый тест на pytest и TestClient | `api/tests/learner_checks.py` |
| 20 | Тестовая БД с откатом транзакции | `api/tests/learner_checks.py` |
| 21 | Что и как тестировать в API | `api/tests/learner_checks.py` |
| 22 | Что такое контейнер | `compose.yaml` |
| 23 | Dockerfile для FastAPI | `api/Dockerfile` |
| 24 | Docker Compose: запускаем весь стек | `compose.yaml` |
| 25 | Заказ и остатки в транзакции | `api/shop/orders.py` |
| 26 | React: оформляем заказ из витрины | `web/src/client.js` |

## Данные и авторизация

- Витрина использует `/api/games` и `/api/orders`. Её стартовый каталог загружается из `api/shop/schema.sql`.
- Упражнения ORM и авторизации находятся в `/api/lab`. Они используют свои таблицы `lab_disks` и `lab_users`, поэтому можно менять учебный инвентарь без изменения основного каталога. При старте API применяет миграции Alembic. Для ручной проверки используйте `docker compose exec api alembic current`.
- Для регистрации используйте вымышленные данные. `SHOP_LABEL` задаёт название в лаборатории, `TOKEN_MINUTES` — срок токена после урока 17. Если `JWT_SECRET` не передан, API генерирует ключ при запуске, поэтому токены после перезапуска перестают действовать. Пароль БД в Compose предназначен для локальной среды.
- `docker compose logs -f api web db` показывает логи. `docker compose down` останавливает сервисы с сохранением базы.

## Тесты

```bash
# Базовые проверки стартового проекта
docker compose exec api python -m pytest -q tests/test_school.py::test_base_catalog_and_existing_card

# Проверка конкретного урока (01–25)
docker compose exec api python -m pytest -q -k lesson_10

# Урок 26 и полный прогон
docker compose exec web pnpm test
docker compose exec api python -m pytest -q
```

Часть проверок в стартовом проекте намеренно падает. Это ожидаемый результат до выполнения заданий. Тесты API используют FastAPI TestClient и настоящий PostgreSQL. Каждый тест с БД создаёт свою схему и удаляет её после завершения. Урок 20 отдельно проверяет откат внешней транзакции и SAVEPOINT. Уроки 22–24 имеют проверки файлов конфигурации и ручные команды Docker.

Документация — [FastAPI и тестирование](https://fastapi.tiangolo.com/tutorial/testing/), [транзакции SQLAlchemy](https://docs.sqlalchemy.org/en/20/orm/session_transaction.html), [Docker Compose и готовность сервисов](https://docs.docker.com/compose/how-tos/startup-order/).

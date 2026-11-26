# Дисковая · Учебник FastAPI

Практический курс на русском языке. Толя продаёт подержанные игры для PS2. Витрина и карточки уже собраны на React, а API использует FastAPI и PostgreSQL. В шести уроках нужно исправить небольшие участки кода и проверить изменения тестами. После курса вы спроектируете отдельный магазин Xbox 360 по техническому заданию на сайте.

## Запуск в WSL или Linux

Если проект уже лежит в `~/projects`, перейдите в него. Для нового скачивания:

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/Nihaochingiz/fastapi-shop-school.git
```

Запустите учебник из папки проекта:

```bash
cd ~/projects/fastapi-shop-school
docker compose up --build -d
docker compose ps
```

- [Учебник](http://localhost:5173/)
- [Магазин Толи](http://localhost:5173/#/shop)
- [ТЗ магазина Xbox 360](http://localhost:5173/#/final)
- [Swagger UI](http://localhost:8000/docs)

Нужен работающий Docker с командой `docker compose`. В Docker Desktop для Windows включите интеграцию с вашим дистрибутивом WSL. Если порт занят, задайте другой через переменные `WEB_PORT` и `API_PORT`, например `WEB_PORT=5175 API_PORT=8005 docker compose up --build -d`. PostgreSQL доступен только внутри сети Compose. Указанные в Compose логин и пароль используются в локальной учебной среде.

## Как проходить

1. Прочитайте теорию и ответьте на вопрос в браузере.
2. Найдите `TODO` по номеру урока в указанном файле. Запустите тест урока, чтобы увидеть текущее поведение.
3. Внесите правку. Исходники примонтированы в контейнеры, поэтому изменение Python и React подхватывается без пересборки.
4. Снова запустите тест и проверьте результат на витрине или в Swagger UI. Отметьте урок как пройденный. Отметка хранится в браузере.
5. После шестого урока откройте итоговое ТЗ. В нём перечислены требования, API и критерии приёмки.

| Урок | Что вы добавите | Где искать |
| --- | --- | --- |
| 01 | Фильтр по максимальной цене | `api/shop/catalog.py` |
| 02 | HTTP 404 для отсутствующей игры | `api/shop/catalog.py` |
| 03 | Валидацию количества через Pydantic | `api/shop/models.py`, `api/shop/orders.py` |
| 04 | Стабильную сортировку по цене | `api/shop/catalog.py` |
| 05 | Списание остатка в транзакции | `api/shop/orders.py` |
| 06 | Отправку заказа из формы React | `web/src/client.js` |

## Тесты

```bash
# Базовая проверка, которая проходит и на стартовом коде
docker compose exec api python -m pytest -q -k base

# Проверка первого урока. Подставьте lesson_02 … lesson_05 для остальных.
docker compose exec api python -m pytest -q -k lesson_01

# Полный набор после внесения правок
docker compose exec api python -m pytest -q
docker compose exec web pnpm test
```

В стартовом наборе ожидается **7 падающих проверок API и 2 падающие проверки клиента**. Они описывают поведение, которое нужно реализовать. На backend тесты работают через FastAPI TestClient и настоящий PostgreSQL. Каждый тест создаёт временную схему с начальными данными и удаляет её после проверки. Тесты клиента проверяют сетевую функцию, которую вызывает React-форма. В том числе проверяются тело запроса, успешный ответ и сообщение об ошибке.

## Как устроен проект

- `api/shop/schema.sql` создаёт таблицы и добавляет шесть стартовых игр при запуске API. PostgreSQL хранит остатки и заказы в томе Compose.
- `api/shop/db.py` открывает подключение через `DATABASE_URL`. FastAPI передаёт его в обработчики через `Depends`.
- `web/src/course.js` содержит уроки и требования итогового проекта. Vite проксирует запросы `/api` в контейнер FastAPI.
- `docker compose logs -f api web db` показывает сообщения сервисов. `docker compose down` останавливает проект с сохранением базы.

Документация — [FastAPI и тестирование](https://fastapi.tiangolo.com/tutorial/testing/), [Docker Compose и готовность сервисов](https://docs.docker.com/compose/how-tos/startup-order/).

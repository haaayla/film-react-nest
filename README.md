# FILM!

## Установка

### PostgreSQL

Установите PostgreSQL (на macOS: `brew install postgresql@18`) или запустите его в Docker (см. ветку `feat/docker`).

Создайте пользователя и базу данных:

`psql postgres -c "CREATE ROLE prac WITH LOGIN PASSWORD 'prac'" -c "CREATE DATABASE prac OWNER prac"`

Затем из корня проекта создайте таблицы и загрузите данные:

`psql -d prac -f backend/test/prac.init.sql`

`psql -d prac -f backend/test/prac.films.sql`

`psql -d prac -f backend/test/prac.shedules.sql`

Первый файл выдаст ошибку, что база `prac` уже существует.

### Бэкенд

Перейдите в папку с исходным кодом бэкенда

`cd backend`

Установите зависимости (точно такие же, как в package-lock.json) помощью команд

`npm ci` или `yarn install --frozen-lockfile`

Создайте `.env` файл из примера `.env.example`, в нём укажите:

* `DATABASE_DRIVER` - тип драйвера СУБД - в проекте это `postgres`
* `DATABASE_URL` - адрес СУБД PostgreSQL, например `postgres://localhost:5432/prac`
* `DATABASE_USERNAME` - имя пользователя базы данных, например `prac`
* `DATABASE_PASSWORD` - пароль пользователя базы данных, например `prac`

PostgreSQL должна быть установлена и запущена.

Запустите бэкенд:

`npm run start:debug`

Для проверки отправьте тестовый запрос с помощью Postman или `curl`.





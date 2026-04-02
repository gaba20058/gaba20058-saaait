Создать .env в backend, и добавить данные строки:
DATABASE_URL="postgresql://postgres:123@localhost:5432"
PORT=3000
JWT_SECRET=123123123

а если дома:
обновить призму:
datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:123@localhost:5432/postgres?schema=public"
}
env:
DATABASE_URL="postgresql://postgres:123@localhost:5432/postgres?schema=public"
PORT=3000
JWT_SECRET=123123123
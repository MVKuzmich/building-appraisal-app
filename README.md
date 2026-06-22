# Building appraisal application

Приложение для страховой оценки строений по белорусским нормам (базисные цены 1991 г.).

## Стек

- **Backend:** Spring Boot 3, Java 17, in-memory JSON, Apache POI
- **Frontend:** React 18, Material UI, AG Grid
- **Инфраструктура:** Docker, nginx, GitHub Actions

## Источник норм

Единственный файл данных: `backend/src/main/resources/data.json` (92 типа строений).

Общие надбавки: `backend/src/main/resources/common-adjustments.json`.

## Запуск локально

```bash
# Backend
mvn -f backend/pom.xml spring-boot:run

# Frontend
cd frontend && npm install && npm start
```

## Docker

```bash
docker compose up --build
```

MongoDB больше не требуется. Feedback сохраняется в файлы в `FILE_UPLOAD_DIR/feedback/`.

## Тесты

```bash
mvn -f backend/pom.xml test
cd frontend && npm test -- --watchAll=false
```

## Документация по рефакторингу

См. [REFACTORING_PLAN.md](./REFACTORING_PLAN.md)

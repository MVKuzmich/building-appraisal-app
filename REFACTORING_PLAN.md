# План рефакторинга Building Appraisal App

Документ фиксирует контекст, цели и этапы рефакторинга. Обновляется по мере выполнения.

## Исходные проблемы (до рефакторинга)

1. **Два `data.json`** — backend (92 типа) и frontend (79 типов), рассинхрон при edit mode
2. **`normAppliance` без точки** — 8 типов считались как «на одно строение» вместо умножения на площадь/объём
3. **Расчёты только на клиенте** — backend не валидировал числа перед Excel
4. **MongoDB для статического справочника** — избыточная инфраструктура
5. **DataLoader** — перезагрузка только при смене количества записей
6. **Бизнес-логика в React-компоненте** (~760 строк) — сложно тестировать
7. **Дублирование логики колонок надбавок** — JS (AG Grid) + Java (Excel)
8. **Aspose.Cells** — коммерческая зависимость; заменяем на Apache POI
9. **Ручной выбор tier** — пользователь мог выбрать неверный диапазон объёма
10. **CI пропускает тесты** — `-DskipTests`, устаревший `App.test.js`
11. **Мёртвый код** — `TechnicalPassportForm`, `DisclaimerModal`, неиспользуемые Java-модели

## Цели рефакторинга

- [x] Единый источник норм: `backend/src/main/resources/data.json`
- [x] Убрать MongoDB (справочник in-memory, feedback — файловое хранилище)
- [x] Вынести расчётную логику в переиспользуемые модули (JS + Java)
- [x] Нормализовать `normAppliance` при загрузке данных
- [x] Автоподбор tier по объёму/площади (где применимо)
- [x] Валидация расчётов на backend при экспорте Excel
- [x] Apache POI для стилизованного Excel (границы, merge, ориентация, A4)
- [x] Тесты: данные, расчёты, API, Excel
- [x] Включить тесты в CI
- [x] Удалить дублирующий frontend `data.json` и мёртвый код

## Статус выполнения

**Ветка:** `cursor/refactoring-norms-and-tests-bf11`

**Сделано:**
- MongoDB удалён из docker-compose и зависимостей
- `BuildingTypeDataService` загружает JSON in-memory
- `AppraisalCalculator` (Java) + `appraisalCalculations.js` (JS)
- `ExcelTableCreator` переписан на Apache POI
- Feedback → `FeedbackFileStorageService` (JSON-файлы)
- API: `GET /api/building-types/{type}`, `GET /api/common-adjustments`
- Frontend: edit mode через API, автоподбор tier, единая логика надбавок
- 17 backend + 4 frontend тестов

## Архитектура после рефакторинга

```
backend/src/main/resources/
  data.json                  ← единственный источник норм (92 типа)
  common-adjustments.json    ← общие надбавки

Backend:
  BuildingTypeDataService    ← загрузка JSON в память, нормализация
  BuildingTypeService        ← поиск по типу/названию
  AppraisalCalculator        ← чистая логика расчёта (Java)
  ExcelTableCreator          ← Apache POI, стилизованный листок
  FeedbackFileStorageService ← feedback в JSON-файлы (без MongoDB)

Frontend:
  utils/appraisalCalculations.js  ← зеркало Java-логики
  utils/adjustmentColumns.js      ← единая логика колонок надбавок
  data/commonAdjustments.js       ← fallback / синхрон с API
  BuildingTypeModal               ← UI + вызов utils
  BuildingTypeList                ← edit mode через API, не локальный JSON
```

## Поток данных

```
data.json → BuildingTypeDataService (in-memory)
         → GET /api/building-types
         → BuildingTypeModal (расчёт на клиенте для UI)
         → estimationList → AG Grid
         → POST /api/export-to-xlsx
         → AppraisalCalculator (пересчёт + валидация)
         → ExcelTableCreator (POI) → XLSX
```

## Формулы расчёта (единый контракт)

```
basedCostWithAdjustments = selectedBasedCost + sum(selectedAdjustments.adjustmentCost)

totalBasedCost = switch(normAppliance):
  PER_CUBIC_METER  → basedCostWithAdjustments × cubic
  PER_SQUARE_METER → basedCostWithAdjustments × area
  PER_BUILDING     → basedCostWithAdjustments

buildingAppraisal = totalBasedCost + totalCommonAdjustments
buildingAppraisalWithWear = buildingAppraisal × (1 - wearRate / 100)
insuredValue = buildingAppraisalWithWear × 0.5
```

## Тестовая пирамида

| Уровень | Что | Файлы |
|---------|-----|-------|
| P0 | Валидация data.json | `BuildingTypeDataValidationTest` |
| P0 | Golden tests расчётов | `AppraisalCalculatorTest`, `appraisalCalculations.test.js` |
| P1 | API поиска | `BuildingTypeControllerTest` |
| P1 | Excel ячейки | `ExcelTableCreatorTest` |
| P2 | RTL модалки | `BuildingTypeModal.test.js` (опционально) |

## Этапы выполнения

### Этап 1 — Backend: данные без MongoDB
- `BuildingTypeDataService` вместо `DataLoader` + MongoDB
- Удалить `@Document`, репозитории building_types
- Нормализация `normAppliance`
- Feedback → файловое хранилище

### Этап 2 — Backend: расчёты и Excel
- `AppraisalCalculator`, `NormAppliance`
- `common-adjustments.json` + endpoint (опционально)
- `ExcelTableCreator` на Apache POI
- Валидация при export

### Этап 3 — Frontend
- Extract `appraisalCalculations.js`, `adjustmentColumns.js`
- Удалить `frontend/src/data/data.json`
- Edit mode через `GET /api/building-types?buildingType=X`
- Автоподбор tier, убрать console.log

### Этап 4 — Тесты и CI
- Backend + frontend unit tests
- CI: убрать `-DskipTests`
- docker-compose: убрать mongodb

### Этап 5 — Cleanup
- Удалить мёртвый код
- Обновить README

## Риски и решения

| Риск | Решение |
|------|---------|
| POI не воспроизведёт стили Aspose | POI поддерживает borders, merge, rotation, page setup — покрыто тестом snapshot ячеек |
| Расхождение JS/Java расчётов | Golden tests с одинаковыми фикстурами на обеих сторонах |
| Feedback без БД | JSON-файлы в `FILE_UPLOAD_DIR/feedback/` |

## Ветка

`cursor/refactoring-norms-and-tests-bf11`

# Многослойная оптимизированная сборка для frontend
FROM node:18-alpine AS deps

# Установка рабочей директории
WORKDIR /app

# Копирование только файлов зависимостей (кэшируется отдельным слоем)
COPY frontend/package*.json ./

# Установка зависимостей с кэшированием
RUN npm ci --only=production && npm cache clean --force

# Этап сборки
FROM node:18-alpine AS build

WORKDIR /app

# Копирование зависимостей из предыдущего слоя
COPY --from=deps /app/node_modules ./node_modules

# Копирование исходного кода
COPY frontend/ ./

# Установка dev зависимостей для сборки
RUN npm ci

# Переменные окружения для сборки
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Сборка приложения
RUN npm run build

# Финальный этап с nginx
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=build /app/build /usr/share/nginx/html

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создание непривилегированного пользователя
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

# Изменение владельца файлов
RUN chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# Переключение на непривилегированного пользователя
USER appuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

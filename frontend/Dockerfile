# Этап сборки
FROM node:18-alpine AS build
WORKDIR /app/frontend  # Убедитесь, что рабочая директория соответствует структуре проекта

# Копируем package.json и package-lock.json для установки зависимостей
COPY frontend/package*.json ./

# Устанавливаем зависимости с помощью npm ci
RUN npm ci

# Копируем остальные файлы фронтенда
COPY frontend/ .  

# Собираем проект
RUN npm run build

# Финальный этап
FROM nginx:alpine

# Копируем собранные файлы фронтенда в Nginx
COPY --from=build /app/frontend/build /usr/share/nginx/html

# Копируем конфигурацию Nginx (из корневой папки проекта)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
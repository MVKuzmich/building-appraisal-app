# Этап сборки
FROM node:18-alpine AS build
WORKDIR /app
# Убрать frontend из пути, так как мы копируем из корневой директории
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN npm run build

# Финальный этап
FROM nginx:alpine
# Изменить путь
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

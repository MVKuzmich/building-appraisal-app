# Многослойная оптимизированная сборка для backend
FROM maven:3-openjdk-17 AS build

# Установка рабочей директории
WORKDIR /app

# Копирование только файлов зависимостей сначала (для кэширования)
COPY pom.xml .
COPY backend/pom.xml backend/

# Скачивание зависимостей (кэшируется отдельным слоем)
RUN mvn -f backend/pom.xml dependency:go-offline -B

# Копирование исходного кода (изменяется чаще всего)
COPY backend/src backend/src

# Сборка приложения
RUN mvn -f backend/pom.xml clean package -DskipTests -B

# Финальный образ
FROM openjdk:17-jdk-alpine

# Установка необходимых пакетов
RUN apk add --no-cache tzdata

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /app

# Копирование JAR файла
COPY --from=build /app/backend/target/*.jar app.jar

# Создание директории для загрузок
RUN mkdir -p /app/uploads && \
    chown -R appuser:appuser /app

# Переключение на непривилегированного пользователя
USER appuser

EXPOSE 8080

# Оптимизированный запуск JVM
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
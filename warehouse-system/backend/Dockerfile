# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование проекта
COPY . .

# Создание директорий для статики и медиа
RUN mkdir -p /app/static /app/media

# Команда для запуска
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
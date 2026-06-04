# ── Stage 1: Build React frontend ──
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── Stage 2: Python backend + serve frontend ──
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY seed.py start.sh ./
COPY backend/ .
COPY --from=frontend-builder /app/dist /app/static

RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]

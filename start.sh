#!/bin/sh

# Start uvicorn in the background
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
UVICORN_PID=$!

# Wait for the server to be ready
echo "⏳  Waiting for server to be ready..."
for i in $(seq 1 30); do
  if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "    Server is up!"
    break
  fi
  sleep 1
done

# Run seeding (non-fatal — if it fails the app still works)
echo "🌱  Running seed script..."
python seed.py || echo "    ⚠  Seeding skipped (will retry on next restart)"

# Bring uvicorn back to foreground
wait $UVICORN_PID

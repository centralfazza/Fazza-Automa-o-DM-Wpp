# 🚢 Directive 04: Deployment

The system is designed to be deployed using **Docker Compose** for consistency across development and production environments.

## 🐳 Docker Stack

- **FastAPI**: The backend server.
- **PostgreSQL**: Stores all persistent data.
- **Redis**: Used for task queuing and caching (optional but recommended for high volume).
- **N8N**: The existing instance must be reachable by the backend.

## ⚙️ Environment Configuration

Create a `.env` file in `execution/backend/` with:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/fazza
X_API_KEY=your_secure_backend_key
INSTAGRAM_VERIFY_TOKEN=fazza_ig_verify
WHATSAPP_VERIFY_TOKEN=fazza_wa_verify
```

## 🚀 Launching
```bash
docker-compose up -d --build
```

## 🛠️ N8N Setup
1. Import `automation_master.json`.
2. Configure **Credentials** for "HTTP Request" nodes to point to the Backend API.
3. Update the `BACKEND_API_URL` variable in N8N.

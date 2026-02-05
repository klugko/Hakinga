<div align="center">

# Hakinga

### Intelligent Typing Training Platform with Machine Learning

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A smart typing training platform that uses **Machine Learning** to analyze your typing patterns, identify weaknesses, and provide personalized training recommendations.

[Features](#features) · [ML Features](#-machine-learning--personalization) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started)

</div>

---

## Overview

Hakinga is a full-stack web application designed to help users master touch typing through competitive practice and detailed analytics. Built with modern technologies and clean architecture principles.

<div align="center">

| Solo Practice | Competitive Racing | Private Sessions | Analytics |
|:-------------:|:------------------:|:----------------:|:---------:|
| Train at your own pace | Real-time multiplayer races | Invite-only rooms | Track your progress |

</div>

---

## Tech Stack

<div align="center">

### Frontend

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Backend

![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)

### Database & Infrastructure

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## Features

<table>
<tr>
<td width="50%">

### Typing Practice
- Multiple text categories (quotes, code, paragraphs)
- Real-time WPM and accuracy calculation
- Visual feedback for errors
- Adaptive difficulty adjustment

### Competition
- Public racing lobby
- Real-time multiplayer races
- Live progress tracking
- Post-race statistics

</td>
<td width="50%">

### Social Features
- Friend system with requests
- Private session invitations
- Global and friend leaderboards

### Authentication
- Secure JWT authentication
- Email verification
- Password reset via email
- Session management with refresh tokens

</td>
</tr>
</table>

---

## Machine Learning & Personalization

> **What makes Hakinga different?** Unlike traditional typing trainers, Hakinga uses Machine Learning to understand your unique typing patterns and create a personalized learning path.

<table>
<tr>
<td width="50%">

### Intelligent Analysis

**Keystroke Data Collection**
- Records every keystroke with precise timing
- Tracks error patterns and correction behavior
- Analyzes typing rhythm and consistency

**Weakness Detection**
- Identifies problematic characters (high error rate)
- Detects difficult bigrams/trigrams (e.g., "qu", "th", "tion")
- Maps weak zones on keyboard layout

**Typing Profile**
- Interactive keyboard heatmap
- Error distribution by character type
- Inter-keystroke timing analysis
- Multi-dimensional skill score (not just WPM)

</td>
<td width="50%">

### Adaptive Learning

**Dynamic Difficulty**
- Auto-adjusts text difficulty based on performance
- Increases challenge when you improve
- Reduces difficulty if accuracy drops

**Targeted Training**
- Generates texts rich in your weak characters
- Custom drill exercises for specific weaknesses
- Personalized training plans

**Predictions & Insights**
- WPM progression prediction (30-day forecast)
- Plateau detection with actionable suggestions
- Daily personalized insights
- Performance pattern analysis (best time of day, etc.)

</td>
</tr>
</table>

<div align="center">

### Skill Level System

| Level | Score | Description |
|:-----:|:-----:|:------------|
| Beginner | 0-20 | Just starting your typing journey |
| Novice | 21-40 | Building fundamental skills |
| Intermediate | 41-60 | Developing speed and accuracy |
| Advanced | 61-80 | Mastering complex patterns |
| Expert | 81-100 | Peak performance achieved |

*Score calculated from: WPM (30%) + Accuracy (30%) + Consistency (20%) + Progression (10%) + Difficulty handling (10%)*

</div>

---

## Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
backend/
├── app/
│   ├── application/      # Business logic and services
│   ├── core/             # Configuration and security
│   ├── domain/           # Entities and repository interfaces
│   ├── infrastructure/   # Database, email, external services
│   └── presentation/     # API routes and schemas
```

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (Auth, Toast)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API client and services
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Utility functions
```

---

## Getting Started

### Quick Start with Docker (Recommended)

The fastest way to run Hakinga is using Docker Compose.

#### Prerequisites

![Docker](https://img.shields.io/badge/Docker-20.10+-2496ED?style=flat-square&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2.0+-2496ED?style=flat-square&logo=docker&logoColor=white)

#### Run with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/hakinga.git
cd hakinga

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your settings (optional for local development)

# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

#### Docker Services

| Service | Description | Port |
|---------|-------------|------|
| `frontend` | React SPA served by Nginx | 3000 |
| `backend` | FastAPI application | 8000 |
| `db` | PostgreSQL 16 database | 5432 |
| `redis` | Redis cache | 6379 |

#### Docker Commands

```bash
# Start services
docker compose up --build

# Stop services
docker compose down

# View logs
docker compose logs -f [service-name]

# Rebuild specific service
docker compose build [service-name]

# Reset database (caution: deletes all data)
docker compose down -v
docker compose up -d

# Access database shell
docker compose exec db psql -U hakinga -d hakinga

# Run backend shell
docker compose exec backend bash
```

---

### Manual Installation (Development)

#### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white)

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hakinga.git
   cd hakinga
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize the database**
   ```bash
   alembic upgrade head
   ```

5. **Set up the frontend**
   ```bash
   cd ../frontend
   cp .env.example .env
   npm install
   ```

#### Running the Application

<table>
<tr>
<td>

**Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```
API: `http://localhost:8000`

</td>
<td>

**Frontend**
```bash
cd frontend
npm run dev
```
App: `http://localhost:5173`

</td>
</tr>
</table>

### API Documentation

| Documentation | URL |
|---------------|-----|
| Swagger UI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |

---

## Environment Variables

<details>
<summary><b>Docker Compose Configuration (.env)</b></summary>

```env
# PostgreSQL
POSTGRES_USER=hakinga
POSTGRES_PASSWORD=<your-secure-password>
POSTGRES_DB=hakinga
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Backend
SECRET_KEY=<generate-a-secure-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10
CORS_ORIGINS=["http://localhost:3000"]
DEBUG=false
RUN_MIGRATIONS=true

# Frontend
VITE_API_URL=http://localhost:8000/api/v1

# Ports
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

</details>

<details>
<summary><b>Backend Configuration (backend/.env)</b></summary>

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/hakinga
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
DEBUG=true
APP_NAME=Hakinga API
API_V1_PREFIX=/api/v1

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email (optional - required for password reset)
EMAIL_HOST=smtp.example.com
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-password
EMAIL_PORT=587
EMAIL_FROM=noreply@hakinga.com
```

</details>

<details>
<summary><b>Frontend Configuration (frontend/.env)</b></summary>

```env
VITE_API_URL=http://localhost:8000/api/v1
```

</details>

---

## Production Deployment

### Security Checklist

Before deploying to production, ensure you:

- [ ] Generate a strong `SECRET_KEY` using: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
- [ ] Set `DEBUG=false`
- [ ] Use strong database passwords
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS (use a reverse proxy like Nginx or Traefik)
- [ ] Configure email settings for password reset functionality

### Docker Production Tips

```bash
# Build for production
docker compose build --no-cache

# Run in detached mode
docker compose up -d

# Scale backend (if needed)
docker compose up -d --scale backend=3

# View resource usage
docker compose stats
```

### Health Checks

All services include health checks:

| Service | Endpoint | Interval |
|---------|----------|----------|
| Backend | `GET /health` | 30s |
| Frontend | `GET /health` | 30s |
| Database | `pg_isready` | 10s |
| Redis | `redis-cli ping` | 10s |

---

## Development

### Code Standards

| Language | Standards |
|----------|-----------|
| Python | Type hints everywhere, Pydantic models, async/await |
| TypeScript | Strict mode, functional components, no `any` |
| Documentation | Docstrings (Python), JSDoc (TypeScript) |

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Inspired by

[![Monkeytype](https://img.shields.io/badge/Monkeytype-FFD700?style=flat-square)](https://monkeytype.com/)
[![TypeRacer](https://img.shields.io/badge/TypeRacer-00A86B?style=flat-square)](https://play.typeracer.com/)

Built with modern web technologies for optimal performance

</div>

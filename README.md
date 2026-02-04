<div align="center">

# Hakinga

### Modern Typing Training Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

A modern, intelligent typing training platform that combines competitive gameplay with personalized learning.

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Architecture](#architecture)

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
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## Features

<table>
<tr>
<td width="50%">

### Authentication
- User registration with email verification
- Secure login with JWT tokens
- Password reset via email
- Session management with refresh tokens

### Typing Practice
- Multiple text categories (quotes, code, paragraphs)
- Real-time WPM and accuracy calculation
- Visual feedback for errors
- Customizable session duration

</td>
<td width="50%">

### Competition
- Public racing lobby
- Real-time multiplayer races
- Live progress tracking
- Post-race statistics

### Social & Analytics
- Friend system with requests
- Private session invitations
- Global and friend leaderboards
- WPM progression charts

</td>
</tr>
</table>

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

### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white)

### Installation

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
   npm install
   ```

### Running the Application

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
<summary><b>Backend Configuration</b></summary>

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/hakinga

# Security
SECRET_KEY=your-secret-key-here
DEBUG=true

# Email (optional)
EMAIL_HOST=smtp.example.com
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-password
EMAIL_PORT=587
EMAIL_FROM=noreply@hakinga.com

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

</details>

<details>
<summary><b>Frontend Configuration</b></summary>

```env
VITE_API_URL=http://localhost:8000/api/v1
```

</details>

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

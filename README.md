# Hakinga

A modern, intelligent typing training platform that combines competitive gameplay with personalized learning. Built for developers and professionals who want to improve their typing speed, accuracy, and consistency.

## Overview

Hakinga is a full-stack web application designed to help users master touch typing through:

- **Solo Practice** - Train at your own pace with various text categories
- **Competitive Racing** - Challenge other users in real-time typing races
- **Private Sessions** - Create invite-only rooms to practice with friends
- **Progress Tracking** - Detailed analytics and performance metrics
- **Achievement System** - Unlock badges as you improve

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **TailwindCSS 4** for styling
- **React Router 7** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy** with async support
- **PostgreSQL** database
- **Alembic** for migrations
- **JWT** authentication with bcrypt password hashing
- **Pydantic** for data validation

### Architecture
The project follows clean architecture principles with clear separation of concerns:

```
backend/
├── app/
│   ├── application/     # Business logic and services
│   ├── core/            # Configuration and security
│   ├── domain/          # Entities and repository interfaces
│   ├── infrastructure/  # Database, email, external services
│   └── presentation/    # API routes and schemas
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Git

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
   # Edit .env with your database credentials and settings
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

**Backend** (from `backend/` directory):
```bash
source venv/bin/activate
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`

**Frontend** (from `frontend/` directory):
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
hakinga/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── application/      # Services and business logic
│   │   ├── core/             # Config, security utilities
│   │   ├── domain/           # Entities, exceptions, interfaces
│   │   ├── infrastructure/   # Repositories, email service
│   │   └── presentation/     # API routes, schemas, deps
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (Auth, Toast)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client and services
│   │   ├── types/            # TypeScript type definitions
│   │   └── lib/              # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── BACKLOG.md                # Product backlog and features
├── instructions.md           # Development guidelines
└── README.md
```

## Features

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

### Competition
- Public racing lobby
- Real-time multiplayer races
- Live progress tracking
- Post-race statistics

### Social Features
- Friend system with requests
- Private session invitations
- Global and friend leaderboards

### Analytics
- Historical performance data
- WPM progression charts
- Accuracy trends
- Session history

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/hakinga
SECRET_KEY=your-secret-key-here
DEBUG=true

# Email configuration (optional)
EMAIL_HOST=smtp.example.com
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-password
EMAIL_PORT=587
EMAIL_FROM=noreply@hakinga.com

# Redis (for caching, optional)
REDIS_URL=redis://localhost:6379
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Development

### Code Style

This project follows strict coding standards:

- **Python**: Type hints everywhere, Pydantic models for validation
- **TypeScript**: Strict mode, functional components only
- **Documentation**: Docstrings for Python, JSDoc for TypeScript
- **No inline comments** unless absolutely necessary

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Monkeytype](https://monkeytype.com/) and [TypeRacer](https://play.typeracer.com/)
- Built with modern web technologies for optimal performance

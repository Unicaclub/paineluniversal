# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack event management system called "Sistema de Gestão de Eventos" with the following architecture:

- **Backend**: Python FastAPI application with PostgreSQL database
- **Frontend**: React + TypeScript application using Vite build tool
- **Architecture**: Separate frontend and backend deployments with API communication

## Development Commands

### Backend (Python/FastAPI)
```bash
cd backend
poetry install                    # Install dependencies
poetry run uvicorn app.main:app --reload --port 8000  # Run development server
poetry run pytest --cov=app --cov-report=html -v      # Run tests with coverage
poetry run python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"  # Create database tables
```

### Frontend (React/TypeScript)
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Run development server (port 3000, proxies to backend:8000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm start           # Preview production build
```

### Full Stack Deployment
```bash
./deploy-pdv.sh     # Deploy both backend and frontend with tests
```

## Code Architecture

### Backend Structure (`/backend`)
- **FastAPI Application**: Main app in `app/main.py` with modular routers
- **Database**: PostgreSQL with SQLAlchemy ORM, models in `app/models.py`
- **Authentication**: JWT-based auth with role-based permissions (admin, promoter, cliente)
- **Key Modules**:
  - Event management (`routers/eventos.py`)
  - User management with CPF-based identification (`routers/usuarios.py`)
  - Check-in system (`routers/checkins.py`)
  - Point-of-sale (PDV) system (`routers/pdv.py`)
  - Financial tracking (`routers/financeiro.py`)
  - Gamification system (`routers/gamificacao.py`)
  - WhatsApp integration (`routers/whatsapp.py`)
  - N8N automation integration (`routers/n8n.py`)
- **WebSocket Support**: Real-time features for PDV and check-ins
- **Services**: Alert service, receipt service, WhatsApp service

### Frontend Structure (`/frontend`)
- **React Router**: Role-based route protection and navigation
- **UI Framework**: Custom components using Radix UI primitives with Tailwind CSS
- **PWA Support**: Progressive Web App with service worker via Vite PWA plugin
- **Key Features**:
  - Dashboard with real-time metrics
  - Event management interface
  - Check-in system (regular and mobile-optimized)
  - Point-of-sale interface
  - Guest list management
  - Financial reporting
  - Gamification/ranking system
- **State Management**: Context API for authentication
- **Build Optimization**: Manual chunk splitting for vendor, UI, charts, and forms

### Database Schema
- Multi-tenant architecture with `Empresa` (Company) as the root entity
- User system based on CPF (Brazilian tax ID) for security
- Event management with different list types (VIP, FREE, PAGANTE, PROMOTER, etc.)
- Transaction tracking with status management
- Gamification system with achievements and rankings

### Key Business Logic
- **CPF-based Security**: All operations use CPF for user identification
- **Role-based Access**: Three main roles (admin, promoter, cliente) with different permissions  
- **Event Lists**: Multiple list types with different access levels and pricing
- **Real-time Updates**: WebSocket connections for live PDV and check-in updates
- **Financial Tracking**: Complete transaction and cash flow management per event
- **WhatsApp Integration**: Automated messaging for confirmations and updates

## API Structure
- Base URL: `/api`
- Authentication: JWT tokens via `/api/auth`
- WebSocket endpoints: `/api/pdv/ws/{evento_id}` and `/api/checkin/ws/{evento_id}`
- Documentation: Available at `/docs` (Swagger) and `/redoc`

## Development Notes
- Frontend proxies API calls to `http://localhost:8000` in development
- CORS is fully open for development (disabled for full-stack development)
- Database migrations handled via direct model metadata creation
- Tests use pytest with async support
- Frontend uses TypeScript with strict configuration
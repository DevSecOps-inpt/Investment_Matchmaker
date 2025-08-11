# Investment Matchmaker - Local MVP

A matchmaking platform for founders and investors that runs entirely on localhost using Docker Compose.

## 🎯 Purpose

Connect entrepreneurs with investors through:
- **Pitch Posting**: Entrepreneurs can post investment pitches with media attachments
- **Smart Matching**: Investors can search and filter pitches based on criteria
- **Direct Communication**: Real-time chat system for discussions
- **Connection Management**: Build professional relationships
- **NDA Gate**: Optional NDA requests for sensitive information

## 🏗️ Tech Stack (Local-Only)

### Frontend
- **Next.js 14** + **Tailwind CSS** for modern UI
- **React Hook Form** for form handling
- **Zustand** for state management
- **Native WebSocket** for real-time communication

### Backend
- **NestJS** REST API with TypeScript
- **Prisma ORM** for database operations
- **JWT** authentication with httpOnly cookies
- **ws** WebSocket server (self-hosted)

### Database & Services
- **PostgreSQL 15** (Docker) with full-text search
- **MailHog** (Docker) for development email testing
- **Local file storage** via Multer to `uploads/` directory

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **Docker & Docker Compose**
- **Git**

### 1. Clone & Setup
```bash
git clone <repository-url>
cd webapp

# Windows
setup.bat

# Unix/Linux/macOS
chmod +x setup.sh
./setup.sh
```

### 2. Start Development
```bash
# Terminal 1: Backend + WebSocket
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 3. Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **WebSocket**: ws://localhost:4001
- **Database**: localhost:5432
- **MailHog UI**: http://localhost:8025

## 📁 Project Structure

```
webapp/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/          # JWT authentication
│   │   ├── users/         # User management
│   │   ├── pitches/       # Pitch CRUD operations
│   │   ├── chat/          # WebSocket chat system
│   │   ├── connections/   # User connections
│   │   ├── search/        # Postgres full-text search
│   │   ├── upload/        # File upload handling
│   │   └── admin/         # Admin operations
│   ├── prisma/            # Database schema & migrations
│   └── uploads/           # Local file storage
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utility functions
│   │   └── store/         # Zustand state management
└── docker-compose.yml      # Postgres + MailHog services
```

## 🔐 Authentication

- **JWT tokens** stored in httpOnly cookies
- **Role-based access**: Entrepreneur, Investor, Admin
- **OAuth providers** can be enabled later (currently disabled for MVP)
- **Rate limiting** on auth routes (5 requests per minute)

## 💾 File Storage

- **Local disk storage** via Multer
- **Static serving** at `/uploads/*` by NestJS
- **MIME type validation** for security
- **File size limit**: 10MB per file
- **Supported types**: Images, PDFs, Documents, Videos

## 🔍 Search & Discovery

- **Postgres full-text search** on pitch title and summary
- **Industry filtering** by investment focus
- **Funding stage matching** for investor preferences
- **Location-based search** for geographic preferences
- **Visibility rules**: Public, Verified Investors, By Request

## 💬 Real-time Chat

- **WebSocket rooms** for pitch discussions and direct messages
- **Message persistence** in PostgreSQL
- **Typing indicators** and read receipts
- **Room-based broadcasting** for efficient messaging
- **JWT authentication** on WebSocket connection (optional)

## 📧 Email System

- **MailHog** for development email testing
- **SMTP configuration** for production readiness
- **Notification emails** for:
  - Connection requests
  - NDA requests
  - New messages
  - System updates

## 🛡️ Security Features

- **CORS** locked to localhost:3000
- **Rate limiting** on sensitive routes
- **JWT validation** on protected endpoints
- **File upload validation** with MIME whitelisting
- **SQL injection protection** via Prisma ORM

## 🗄️ Database Schema

### Core Models
- **Users**: Entrepreneurs, Investors, Admins
- **Pitches**: Investment opportunities with metadata
- **ChatRooms**: Real-time communication channels
- **Connections**: Professional relationships
- **Messages**: Chat history and persistence
- **Notifications**: System and user notifications

### Full-Text Search Indexes
```sql
-- Pitch search optimization
@@fulltext([title, summary])
@@index([industry])
@@index([fundingStage])
@@index([location])
@@index([isActive])
@@index([createdAt])
```

## 🚫 What's NOT Included (MVP Scope)

- ❌ **Cloud storage** (S3, Cloudinary) - Local disk only
- ❌ **Redis pub/sub** - Single process WebSocket
- ❌ **Elasticsearch** - Postgres full-text search
- ❌ **Hosted deployment** - Local development only
- ❌ **Production email** - MailHog for testing

## 🔧 Development Commands

### Backend
```bash
cd backend
npm run start:dev          # Development server
npm run build              # Build for production
npm run start:prod         # Production server
npx prisma migrate dev     # Run migrations
npx prisma studio          # Database GUI
```

### Frontend
```bash
cd frontend
npm run dev                # Development server
npm run build              # Build for production
npm run start              # Production server
npm run lint               # ESLint checking
```

### Database
```bash
# Reset database
cd backend
npx prisma migrate reset

# Seed data (if available)
npm run seed
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### Pitches
- `GET /pitches` - Search and filter pitches
- `POST /pitches` - Create new pitch
- `PUT /pitches/:id` - Update pitch
- `DELETE /pitches/:id` - Delete pitch

### Chat
- `GET /chat/rooms` - User's chat rooms
- `GET /chat/rooms/:id/messages` - Chat history
- `POST /chat/rooms` - Create chat room

### Uploads
- `POST /storage/upload` - File upload
- `GET /uploads/*` - Static file serving

## 📱 Frontend Features

- **Responsive design** with Tailwind CSS
- **Real-time updates** via WebSocket
- **Form validation** with React Hook Form
- **State management** with Zustand
- **File upload** with drag & drop support
- **Search filters** with instant results

## 🐳 Docker Services

### PostgreSQL
- **Port**: 5432
- **Database**: app
- **User**: app
- **Password**: app
- **Volume**: Persistent data storage

### MailHog
- **SMTP Port**: 1025
- **Web UI Port**: 8025
- **Purpose**: Email testing and debugging

## 🔄 Environment Variables

The setup scripts create a root `.env` file with:
- Database connection string
- JWT secrets (development only)
- WebSocket configuration
- SMTP settings for MailHog
- Rate limiting parameters
- Frontend public URLs

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 4000, 4001, 5432, 8025 are free
2. **Database connection**: Wait for Docker services to fully start
3. **File uploads**: Check `uploads/` directory permissions
4. **WebSocket connection**: Verify backend is running on port 4001

### Reset Everything
```bash
# Stop all services
docker-compose down -v

# Remove uploads
rm -rf uploads backend/uploads

# Re-run setup
./setup.sh  # or setup.bat on Windows
```

## 📈 Next Steps (Post-MVP)

- **Cloud deployment** (AWS, Vercel, Railway)
- **Redis integration** for WebSocket scaling
- **Elasticsearch** for advanced search
- **S3/Cloudinary** for file storage
- **Production email** (SendGrid, AWS SES)
- **Analytics** and user behavior tracking
- **Mobile app** (React Native)
- **Advanced matching algorithms**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Docker
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the startup ecosystem**

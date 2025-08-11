# 🚀 Quick Startup Guide

## First Time Setup

### 1. Prerequisites
- **Node.js 18+** installed
- **Docker & Docker Compose** installed
- **Git** installed

### 2. Initial Setup
```bash
# Windows
setup.bat

# Unix/Linux/macOS
chmod +x setup.sh
./setup.sh
```

This will:
- Create `.env` file with local configuration
- Start PostgreSQL and MailHog via Docker
- Install dependencies for both frontend and backend
- Run database migrations
- Create uploads directories

## Daily Development

### Option 1: Use Development Scripts (Recommended)
```bash
# Windows
dev.bat

# Unix/Linux/macOS
./dev.sh
```

### Option 2: Manual Startup
```bash
# Terminal 1: Backend + WebSocket
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Option 3: Root Package Scripts
```bash
# Start both services
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

## Access Your Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **WebSocket**: ws://localhost:4001
- **Database**: localhost:5432
- **MailHog UI**: http://localhost:8025

## Quick Commands

### Database Operations
```bash
# View database in browser
npm run db:studio

# Run migrations
npm run db:migrate

# Reset database
cd backend
npx prisma migrate reset
```

### Stop Services
```bash
# Stop Docker services
docker-compose down

# Stop development servers
# Use Ctrl+C in terminal windows
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Unix/Linux/macOS

# Kill the process or use different ports
```

### Database Connection Issues
```bash
# Restart Docker services
docker-compose restart

# Check if PostgreSQL is running
docker-compose ps
```

### File Upload Issues
```bash
# Check uploads directory exists
ls uploads/
ls backend/uploads/

# Recreate if missing
mkdir -p uploads backend/uploads
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reloading
2. **Database Changes**: Use Prisma Studio for visual database management
3. **Email Testing**: Use MailHog UI to see all sent emails
4. **File Storage**: Uploads are stored locally in `uploads/` directory
5. **WebSocket**: Backend automatically starts WebSocket server on port 4001

## Next Steps

After getting the basic setup running:
1. Create your first user account
2. Post a test pitch
3. Test the search functionality
4. Try the real-time chat
5. Upload some test files

---

**Need help?** Check the main README.md for detailed documentation.

# 🚀 Investment Matchmaker - Startup Guide

## Quick Start (Windows)

### Option 1: Use the Batch Files (Recommended)

1. **Start the Backend:**
   - Double-click `start-backend.bat`
   - Wait for the message "Application startup complete"
   - Keep this window open

2. **Start the Frontend (in a new terminal):**
   - Double-click `start-frontend.bat`
   - Wait for the browser to open automatically
   - The app will be available at `http://localhost:3000`

### Option 2: Manual Startup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## What You'll See

### Backend (Port 8000)
- FastAPI server running with WebSocket support
- API endpoints for startups and chat rooms
- Real-time messaging infrastructure

### Frontend (Port 3000)
- Modern React application
- Startup listings and creation forms
- Real-time chat interface
- Responsive design for all devices

## Testing the Platform

1. **Create a Startup:**
   - Click "Post Your Startup" on the homepage
   - Fill out the form with your idea
   - Submit to create your listing

2. **Browse Startups:**
   - View all posted startups on the homepage
   - Click on any startup to see details

3. **Start a Chat:**
   - Click "Start Chat with Founder" on any startup
   - Enter messages in the chat room
   - Experience real-time communication

## Troubleshooting

### Backend Issues
- **Port 8000 in use:** Close other applications using port 8000
- **Python not found:** Install Python 3.8+ and add to PATH
- **Dependencies error:** Run `pip install -r requirements.txt` again

### Frontend Issues
- **Port 3000 in use:** Close other applications using port 3000
- **Node.js not found:** Install Node.js 16+ and add to PATH
- **Dependencies error:** Run `npm install` again

### WebSocket Issues
- **Chat not working:** Ensure backend is running on port 8000
- **Connection errors:** Check browser console for WebSocket errors
- **CORS issues:** Verify backend CORS settings

## Development

### Adding Features
- **Backend:** Modify `backend/main.py`
- **Frontend:** Modify files in `frontend/src/components/`
- **Styling:** Modify `frontend/src/App.css`

### Database Integration
The current version uses in-memory storage. To add SQLite:
1. Install `sqlalchemy` and `alembic`
2. Create database models
3. Replace in-memory operations

### Authentication
To add user login:
1. Implement JWT tokens
2. Add login/register endpoints
3. Create user management components

## File Structure
```
webapp/
├── backend/           # FastAPI server
├── frontend/          # React application
├── start-backend.bat  # Windows backend starter
├── start-frontend.bat # Windows frontend starter
└── README.md          # Full documentation
```

## Support

If you encounter issues:
1. Check the console/terminal for error messages
2. Verify both services are running
3. Check that ports 8000 and 3000 are available
4. Ensure all dependencies are installed

---

**Happy investing! 🚀💰**

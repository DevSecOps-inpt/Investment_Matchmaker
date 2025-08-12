# 🚀 Investment Matchmaker

A local-only platform where entrepreneurs can post their startup ideas and investors can browse and chat with them in real-time.

## Features

- **Startup Listings**: Entrepreneurs can post their startup ideas with descriptions, categories, and funding needs
- **Real-time Chat**: WebSocket-based chat system for investors and entrepreneurs
- **Room-based Messaging**: Isolated chat rooms for each startup-investor conversation
- **Modern UI**: Clean, responsive React frontend with beautiful styling
- **Local Development**: No external dependencies, runs entirely on your machine

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **WebSockets** - Native real-time communication
- **Pydantic** - Data validation and serialization
- **In-memory Storage** - Simple data persistence (ready for SQLite extension)

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **React Router** - Client-side routing
- **CSS Grid/Flexbox** - Responsive design
- **Native WebSocket API** - Real-time communication

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server:**
   ```bash
   python run.py
   ```
   
   Or alternatively:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

### For Entrepreneurs
1. Visit the homepage and click "Post Your Startup"
2. Fill out the form with your startup details
3. Submit to create your listing
4. Wait for investors to reach out via chat

### For Investors
1. Browse startup listings on the homepage
2. Click on interesting startups to view details
3. Click "Start Chat with Founder" to open a chat room
4. Send messages and discuss investment opportunities

## API Endpoints

### REST API
- `GET /` - API status
- `GET /startups` - List all startups
- `POST /startups` - Create a new startup
- `GET /startups/{id}` - Get startup details
- `POST /chat-rooms` - Create a chat room
- `GET /chat-rooms/{id}/messages` - Get chat messages

### WebSocket
- `ws://localhost:8000/ws` - WebSocket endpoint for real-time chat

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application with WebSocket support
│   ├── run.py               # Development server runner
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html       # Main HTML file
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── StartupList.tsx
│   │   │   ├── StartupDetail.tsx
│   │   │   ├── ChatRoom.tsx
│   │   │   └── CreateStartup.tsx
│   │   ├── App.tsx          # Main app component
│   │   ├── App.css          # Main styles
│   │   ├── index.tsx        # App entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Node.js dependencies
│   └── tsconfig.json        # TypeScript configuration
└── README.md                # This file
```

## Development

### Adding New Features
- **Backend**: Add new endpoints in `main.py` and extend the data models
- **Frontend**: Create new components in `src/components/` and add routes in `App.tsx`

### Database Integration
The current implementation uses in-memory storage. To add SQLite:

1. Install `sqlalchemy` and `alembic`
2. Create database models
3. Replace in-memory storage with database operations
4. Add database migrations

### Authentication
To add user authentication:

1. Implement JWT token generation and validation
2. Add login/register endpoints
3. Create user management components
4. Replace placeholder sender IDs with actual user IDs

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check Python version (3.8+ required)
- Verify all dependencies are installed
- Check if port 8000 is available

**Frontend won't start:**
- Ensure Node.js 16+ is installed
- Run `npm install` to install dependencies
- Check if port 3000 is available

**WebSocket connection fails:**
- Ensure backend is running on port 8000
- Check browser console for connection errors
- Verify CORS settings in backend

**Chat not working:**
- Check WebSocket connection status
- Verify room ID is correct
- Check browser console for errors

## Future Enhancements

- [ ] SQLite database integration
- [ ] User authentication and profiles
- [ ] File uploads for startup documents
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Investment tracking
- [ ] Due diligence tools
- [ ] Mobile app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

---

**Happy investing! 🚀💰**

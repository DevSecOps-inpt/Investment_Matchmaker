from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
from datetime import datetime
import uuid

app = FastAPI(title="Investment Matchmaker API", version="1.0.0")

# CORS configuration for local development
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class StartupCreate(BaseModel):
    title: str
    description: str
    owner: str
    category: str = "General"
    funding_needed: Optional[float] = None

class Startup(StartupCreate):
    id: str
    created_at: str
    owner_id: str

class CreateChatRoomRequest(BaseModel):
    startup_id: str
    investor_id: str

class Message(BaseModel):
    id: str
    room_id: str
    sender_id: str
    content: str
    timestamp: str

class ChatRoom(BaseModel):
    id: str
    startup_id: str
    investor_id: str
    entrepreneur_id: str
    created_at: str

# In-memory storage (replace with SQLite later)
startups: Dict[str, Startup] = {}
chat_rooms: Dict[str, ChatRoom] = {}
messages: Dict[str, List[Message]] = {}

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.room_subscriptions: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        # Remove from all room subscriptions
        for room_connections in self.room_subscriptions.values():
            if websocket in room_connections:
                room_connections.remove(websocket)

    async def join_room(self, websocket: WebSocket, room_id: str):
        if room_id not in self.room_subscriptions:
            self.room_subscriptions[room_id] = []
        if websocket not in self.room_subscriptions[room_id]:
            self.room_subscriptions[room_id].append(websocket)

    async def send_to_room(self, room_id: str, message: dict):
        if room_id in self.room_subscriptions:
            for connection in self.room_subscriptions[room_id]:
                try:
                    await connection.send_json(message)
                except:
                    # Remove broken connections
                    if connection in self.room_subscriptions[room_id]:
                        self.room_subscriptions[room_id].remove(connection)

manager = ConnectionManager()

# REST API endpoints
@app.get("/")
async def root():
    return {"message": "Investment Matchmaker API", "status": "running"}

@app.get("/startups", response_model=List[Startup])
async def list_startups():
    return list(startups.values())

@app.post("/startups", response_model=Startup)
async def create_startup(startup: StartupCreate):
    startup_id = str(uuid.uuid4())
    new_startup = Startup(
        id=startup_id,
        owner_id="entrepreneur_123",  # Placeholder - replace with actual auth
        created_at=datetime.now().isoformat(),
        **startup.model_dump()
    )
    startups[startup_id] = new_startup
    return new_startup

@app.get("/startups/{startup_id}", response_model=Startup)
async def get_startup(startup_id: str):
    if startup_id not in startups:
        raise HTTPException(status_code=404, detail="Startup not found")
    return startups[startup_id]

@app.post("/chat-rooms", response_model=ChatRoom)
async def create_chat_room(request: CreateChatRoomRequest):
    if request.startup_id not in startups:
        raise HTTPException(status_code=404, detail="Startup not found")
    
    startup = startups[request.startup_id]
    room_id = str(uuid.uuid4())
    
    new_room = ChatRoom(
        id=room_id,
        startup_id=request.startup_id,
        investor_id=request.investor_id,
        entrepreneur_id=startup.owner_id,
        created_at=datetime.now().isoformat()
    )
    
    chat_rooms[room_id] = new_room
    messages[room_id] = []
    return new_room

@app.get("/chat-rooms/{room_id}/messages", response_model=List[Message])
async def get_room_messages(room_id: str):
    if room_id not in messages:
        raise HTTPException(status_code=404, detail="Chat room not found")
    return messages[room_id]

# WebSocket endpoint for real-time chat
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "joinRoom":
                await manager.join_room(websocket, data["roomId"])
                # Send existing messages
                if data["roomId"] in messages:
                    for msg in messages[data["roomId"]]:
                        await websocket.send_json({
                            "type": "receiveMessage",
                            "payload": {
                                "id": msg.id,
                                "senderId": msg.sender_id,
                                "content": msg.content,
                                "timestamp": msg.timestamp
                            }
                        })
                        
            elif data["type"] == "sendMessage":
                room_id = data["roomId"]
                if room_id not in messages:
                    messages[room_id] = []
                
                # Create and store message
                message = Message(
                    id=str(uuid.uuid4()),
                    room_id=room_id,
                    sender_id=data["senderId"],
                    content=data["content"],
                    timestamp=datetime.now().isoformat()
                )
                messages[room_id].append(message)
                
                # Broadcast to room
                await manager.send_to_room(room_id, {
                    "type": "receiveMessage",
                    "payload": {
                        "id": message.id,
                        "senderId": message.sender_id,
                        "content": message.content,
                        "timestamp": message.timestamp
                    }
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

interface ExtWebSocket extends WebSocket {
  subscribedRoom?: string;
  userId?: string;
}

@Injectable()
export class ChatGateway implements OnModuleInit {
  private wss: WebSocketServer;
  
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  onModuleInit() {
    const wsPort = parseInt(this.configService.get('WS_PORT') || '4001');
    this.wss = new WebSocketServer({ port: wsPort });

    this.wss.on('connection', async (ws: ExtWebSocket, req) => {
      console.log('New WebSocket connection established');

      // Optional JWT authentication on connection
      try {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        
        if (token) {
          try {
            const payload = this.jwtService.verify(token, {
              secret: this.configService.get('JWT_SECRET')!,
            });
            ws.userId = payload.sub;
            console.log('WebSocket authenticated for user:', ws.userId);
          } catch (error) {
            console.log('Invalid JWT token, proceeding without authentication');
          }
        }
      } catch (error) {
        console.log('No token provided, proceeding without authentication');
      }

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleMessage(ws, data);
        } catch (err) {
          console.error('Invalid message format:', err);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log(`WebSocket server running on port ${wsPort}`);
  }

  private async handleMessage(ws: ExtWebSocket, data: any) {
    switch (data.type) {
      case 'joinRoom':
        await this.handleJoinRoom(ws, data);
        break;
      case 'leaveRoom':
        await this.handleLeaveRoom(ws, data);
        break;
      case 'sendMessage':
        await this.handleSendMessage(ws, data);
        break;
      case 'typing':
        await this.handleTyping(ws, data);
        break;
      case 'readReceipt':
        await this.handleReadReceipt(ws, data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private async handleJoinRoom(ws: ExtWebSocket, data: any) {
    const { roomId } = data;
    
    try {
      // Verify user is a participant in this room
      const participant = await this.prisma.chatRoomParticipant.findFirst({
        where: {
          roomId,
          userId: ws.userId || data.userId,
        },
      });

      if (!participant) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Not authorized to join this room'
        }));
        return;
      }

      ws.subscribedRoom = roomId;
      ws.send(JSON.stringify({
        type: 'roomJoined',
        roomId,
      }));

      console.log(`User ${ws.userId || data.userId} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to join room'
      }));
    }
  }

  private async handleLeaveRoom(ws: ExtWebSocket, data: any) {
    const { roomId } = data;
    
    if (ws.subscribedRoom === roomId) {
      ws.subscribedRoom = undefined;
      ws.send(JSON.stringify({
        type: 'roomLeft',
        roomId,
      }));
      console.log(`User left room ${roomId}`);
    }
  }

  private async handleSendMessage(ws: ExtWebSocket, data: any) {
    const { roomId, content, type = 'text' } = data;
    const senderId = ws.userId || data.senderId;

    if (!senderId) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication required to send messages'
      }));
      return;
    }

    try {
      // Verify user is a participant in this room
      const participant = await this.prisma.chatRoomParticipant.findFirst({
        where: {
          roomId,
          userId: senderId,
        },
      });

      if (!participant) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Not authorized to send messages in this room'
        }));
        return;
      }

      // Create message in database
      const message = await this.prisma.message.create({
        data: {
          roomId,
          senderId,
          content,
          type,
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Broadcast message to all clients in the room
      this.broadcastToRoom(roomId, {
        type: 'receiveMessage',
        payload: message,
      });

      console.log(`Message sent in room ${roomId} by user ${senderId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to send message'
      }));
    }
  }

  private async handleTyping(ws: ExtWebSocket, data: any) {
    const { roomId, isTyping } = data;
    
    if (ws.subscribedRoom === roomId) {
      this.broadcastToRoom(roomId, {
        type: 'typing',
        roomId,
        isTyping,
        userId: ws.userId || data.userId,
      });
    }
  }

  private async handleReadReceipt(ws: ExtWebSocket, data: any) {
    const { messageId, userId } = data;
    
    try {
      await this.prisma.messageReadReceipt.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          messageId,
          userId,
          readAt: new Date(),
        },
      });

      // Broadcast read receipt to room
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        select: { roomId: true },
      });

      if (message) {
        this.broadcastToRoom(message.roomId, {
          type: 'readReceipt',
          messageId,
          userId,
        });
      }
    } catch (error) {
      console.error('Error handling read receipt:', error);
    }
  }

  private broadcastToRoom(roomId: string, message: any) {
    this.wss.clients.forEach((client: ExtWebSocket) => {
      if (
        client.readyState === 1 && 
        client.subscribedRoom === roomId
      ) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public sendToUser(userId: string, message: any) {
    this.wss.clients.forEach((client: ExtWebSocket) => {
      if (
        client.readyState === 1 && 
        client.userId === userId
      ) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public getConnectedUsersCount(): number {
    return this.wss.clients.size;
  }
}

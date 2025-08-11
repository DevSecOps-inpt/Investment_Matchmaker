import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRoom, Message, User } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createDirectChatRoom(userId1: string, userId2: string): Promise<ChatRoom> {
    // Check if room already exists
    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: {
              in: [userId1, userId2],
            },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (existingRoom && existingRoom.participants.length === 2) {
      return existingRoom;
    }

    // Create new room
    const room = await this.prisma.chatRoom.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { userId: userId1 },
            { userId: userId2 },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return room;
  }

  async createPitchDiscussionRoom(pitchId: string, entrepreneurId: string, investorId: string): Promise<ChatRoom> {
    const room = await this.prisma.chatRoom.create({
      data: {
        type: 'PITCH_DISCUSSION',
        pitchId,
        participants: {
          create: [
            { userId: entrepreneurId },
            { userId: investorId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        pitch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return room;
  }

  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    return this.prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        pitch: {
          select: {
            id: true,
            title: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getChatRoomMessages(roomId: string, userId: string, page = 1, limit = 50): Promise<{
    messages: Message[];
    total: number;
    hasMore: boolean;
  }> {
    // Verify user is participant
    const participant = await this.prisma.chatRoomParticipant.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!participant) {
      throw new ForbiddenException('Access denied to this chat room');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { roomId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({
        where: { roomId },
      }),
    ]);

    return {
      messages: messages.reverse(), // Show oldest first
      total,
      hasMore: skip + limit < total,
    };
  }

  async sendMessage(roomId: string, senderId: string, content: string, type = 'text'): Promise<Message> {
    // Verify user is participant
    const participant = await this.prisma.chatRoomParticipant.findFirst({
      where: {
        roomId,
        userId: senderId,
      },
    });

    if (!participant) {
      throw new ForbiddenException('Access denied to this chat room');
    }

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
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        attachments: true,
      },
    });

    // Update room's updatedAt timestamp
    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
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
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      select: { id: true },
    });

    const roomIds = rooms.map(room => room.id);

    const unreadCount = await this.prisma.message.count({
      where: {
        roomId: { in: roomIds },
        NOT: {
          readReceipts: {
            some: {
              userId,
            },
          },
        },
        senderId: { not: userId },
      },
    });

    return unreadCount;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  async getChatRoomById(roomId: string, userId: string): Promise<ChatRoom> {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        pitch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    // Verify user is participant
    const isParticipant = room.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Access denied to this chat room');
    }

    return room;
  }
}

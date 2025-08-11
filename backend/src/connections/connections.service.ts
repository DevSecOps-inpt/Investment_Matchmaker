import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@Injectable()
export class ConnectionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createConnectionDto: CreateConnectionDto) {
    const { recipientId, pitchId, message } = createConnectionDto;

    // Check if connection already exists
    const existingConnection = await this.prisma.connection.findUnique({
      where: {
        requesterId_recipientId_pitchId: {
          requesterId: userId,
          recipientId,
          pitchId: pitchId || '',
        },
      },
    });

    if (existingConnection) {
      throw new ConflictException('Connection request already exists');
    }

    // Verify pitch exists if provided
    if (pitchId) {
      const pitch = await this.prisma.pitch.findUnique({
        where: { id: pitchId },
      });

      if (!pitch) {
        throw new NotFoundException('Pitch not found');
      }
    }

    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Create connection request
    const connection = await this.prisma.connection.create({
      data: {
        requesterId: userId,
        recipientId,
        pitchId,
        message,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            entrepreneur: true,
            investor: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        pitch: {
          select: {
            id: true,
            title: true,
            summary: true,
          },
        },
      },
    });

    // TODO: Send notification to recipient
    // await this.notificationsService.createNotification({
    //   userId: recipientId,
    //   type: 'CONNECTION_REQUEST',
    //   title: 'New Connection Request',
    //   message: `${connection.requester.firstName} ${connection.requester.lastName} sent you a connection request`,
    //   data: { connectionId: connection.id },
    // });

    return connection;
  }

  async findUserConnections(userId: string, type: 'sent' | 'received' = 'received', page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where = type === 'sent' 
      ? { requesterId: userId }
      : { recipientId: userId };

    const [connections, total] = await Promise.all([
      this.prisma.connection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
              entrepreneur: true,
              investor: true,
            },
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
              entrepreneur: true,
              investor: true,
            },
          },
          pitch: {
            select: {
              id: true,
              title: true,
              summary: true,
            },
          },
        },
      }),
      this.prisma.connection.count({ where }),
    ]);

    return {
      data: connections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(connectionId: string, userId: string, updateDto: UpdateConnectionDto) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        requester: true,
        recipient: true,
        pitch: true,
      },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    // Only the recipient can update the connection status
    if (connection.recipientId !== userId) {
      throw new ForbiddenException('Only the recipient can update connection status');
    }

    const updatedConnection = await this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: updateDto.status },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        pitch: {
          select: {
            id: true,
            title: true,
            summary: true,
          },
        },
      },
    });

    // If connection is accepted, create a chat room
    if (updateDto.status === 'ACCEPTED') {
      await this.createChatRoom(connection);
    }

    // TODO: Send notification to requester
    // await this.notificationsService.createNotification({
    //   userId: connection.requesterId,
    //   type: 'CONNECTION_REQUEST',
    //   title: 'Connection Request Updated',
    //   message: `Your connection request was ${updateDto.status.toLowerCase()}`,
    //   data: { connectionId: connection.id },
    // });

    return updatedConnection;
  }

  private async createChatRoom(connection: any) {
    // Check if chat room already exists
    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: {
        type: 'PITCH_DISCUSSION',
        pitchId: connection.pitchId,
        participants: {
          every: {
            userId: {
              in: [connection.requesterId, connection.recipientId],
            },
          },
        },
      },
    });

    if (existingRoom) {
      return existingRoom;
    }

    // Create new chat room
    const chatRoom = await this.prisma.chatRoom.create({
      data: {
        type: connection.pitchId ? 'PITCH_DISCUSSION' : 'DIRECT',
        pitchId: connection.pitchId,
        participants: {
          create: [
            { userId: connection.requesterId },
            { userId: connection.recipientId },
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

    return chatRoom;
  }

  async findOne(id: string, userId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            entrepreneur: true,
            investor: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            entrepreneur: true,
            investor: true,
          },
        },
        pitch: {
          select: {
            id: true,
            title: true,
            summary: true,
          },
        },
      },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    // Only participants can view the connection
    if (connection.requesterId !== userId && connection.recipientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return connection;
  }
}

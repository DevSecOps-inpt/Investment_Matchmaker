import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ 
        where: { 
          userId, 
          read: false 
        } 
      }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { unreadCount: count };
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // Helper methods for creating specific notification types
  async createConnectionNotification(userId: string, requesterName: string, connectionId: string) {
    return this.create({
      userId,
      type: 'CONNECTION_REQUEST',
      title: 'New Connection Request',
      message: `${requesterName} sent you a connection request`,
      data: { connectionId },
    });
  }

  async createNDANotification(userId: string, requesterName: string, ndaId: string) {
    return this.create({
      userId,
      type: 'NDA_REQUEST',
      title: 'New NDA Request',
      message: `${requesterName} sent you an NDA request`,
      data: { ndaId },
    });
  }

  async createMessageNotification(userId: string, senderName: string, roomId: string) {
    return this.create({
      userId,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      message: `${senderName} sent you a message`,
      data: { roomId },
    });
  }

  async createPitchViewNotification(userId: string, viewerName: string, pitchId: string) {
    return this.create({
      userId,
      type: 'PITCH_VIEW',
      title: 'Pitch Viewed',
      message: `${viewerName} viewed your pitch`,
      data: { pitchId },
    });
  }
}

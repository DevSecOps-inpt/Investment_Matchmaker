import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNdaRequestDto } from './dto/create-nda-request.dto';
import { UpdateNdaRequestDto } from './dto/update-nda-request.dto';

@Injectable()
export class NdaService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createNdaRequestDto: CreateNdaRequestDto) {
    const { recipientId, pitchId, message } = createNdaRequestDto;

    // Check if NDA request already exists
    const existingNda = await this.prisma.nDARequest.findUnique({
      where: {
        requesterId_recipientId_pitchId: {
          requesterId: userId,
          recipientId,
          pitchId,
        },
      },
    });

    if (existingNda) {
      throw new ConflictException('NDA request already exists');
    }

    // Verify pitch exists
    const pitch = await this.prisma.pitch.findUnique({
      where: { id: pitchId },
    });

    if (!pitch) {
      throw new NotFoundException('Pitch not found');
    }

    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Create NDA request
    const ndaRequest = await this.prisma.nDARequest.create({
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
    // await this.notificationsService.createNDANotification(
    //   recipientId,
    //   `${ndaRequest.requester.firstName} ${ndaRequest.requester.lastName}`,
    //   ndaRequest.id
    // );

    return ndaRequest;
  }

  async findUserNdaRequests(userId: string, type: 'sent' | 'received' = 'received', page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where = type === 'sent' 
      ? { requesterId: userId }
      : { recipientId: userId };

    const [ndaRequests, total] = await Promise.all([
      this.prisma.nDARequest.findMany({
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
      }),
      this.prisma.nDARequest.count({ where }),
    ]);

    return {
      data: ndaRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(ndaRequestId: string, userId: string, updateDto: UpdateNdaRequestDto) {
    const ndaRequest = await this.prisma.nDARequest.findUnique({
      where: { id: ndaRequestId },
      include: {
        requester: true,
        recipient: true,
        pitch: true,
      },
    });

    if (!ndaRequest) {
      throw new NotFoundException('NDA request not found');
    }

    // Only the recipient can update the NDA request status
    if (ndaRequest.recipientId !== userId) {
      throw new ForbiddenException('Only the recipient can update NDA request status');
    }

    const updatedNdaRequest = await this.prisma.nDARequest.update({
      where: { id: ndaRequestId },
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

    // TODO: Send notification to requester
    // await this.notificationsService.createNotification({
    //   userId: ndaRequest.requesterId,
    //   type: 'NDA_REQUEST',
    //   title: 'NDA Request Updated',
    //   message: `Your NDA request was ${updateDto.status.toLowerCase()}`,
    //   data: { ndaRequestId: ndaRequest.id },
    // });

    return updatedNdaRequest;
  }

  async findOne(id: string, userId: string) {
    const ndaRequest = await this.prisma.nDARequest.findUnique({
      where: { id },
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

    if (!ndaRequest) {
      throw new NotFoundException('NDA request not found');
    }

    // Only participants can view the NDA request
    if (ndaRequest.requesterId !== userId && ndaRequest.recipientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return ndaRequest;
  }

  async checkNdaAccess(userId: string, pitchId: string) {
    // Check if user has accepted NDA for this pitch
    const acceptedNda = await this.prisma.nDARequest.findFirst({
      where: {
        recipientId: userId,
        pitchId,
        status: 'ACCEPTED',
      },
    });

    return { hasAccess: !!acceptedNda };
  }
}

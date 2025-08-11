import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePitchDto } from './dto/create-pitch.dto';
import { UpdatePitchDto } from './dto/update-pitch.dto';
import { SearchPitchesDto } from './dto/search-pitches.dto';

@Injectable()
export class PitchesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPitchDto: CreatePitchDto) {
    // Check if user has entrepreneur profile
    const entrepreneur = await this.prisma.entrepreneur.findUnique({
      where: { userId },
    });

    if (!entrepreneur) {
      throw new ForbiddenException('Only entrepreneurs can create pitches');
    }

    return this.prisma.pitch.create({
      data: {
        ...createPitchDto,
        entrepreneurId: entrepreneur.id,
      },
      include: {
        entrepreneur: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                location: true,
              },
            },
          },
        },
        attachments: true,
      },
    });
  }

  async findAll(searchDto: SearchPitchesDto, userId?: string) {
    const {
      page = 1,
      limit = 20,
      industry,
      fundingStage,
      location,
      q,
      visibility,
    } = searchDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (industry) {
      where.industry = industry;
    }

    if (fundingStage) {
      where.fundingStage = fundingStage;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Handle visibility based on user role
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { investor: true },
      });

      if (user?.role === 'INVESTOR' && user.investor?.verified) {
        // Verified investors can see all pitches
        where.visibility = {
          in: ['PUBLIC', 'VERIFIED_INVESTORS'],
        };
      } else if (user?.role === 'INVESTOR') {
        // Unverified investors can only see public pitches
        where.visibility = 'PUBLIC';
      } else {
        // Entrepreneurs and others can see public pitches
        where.visibility = 'PUBLIC';
      }
    } else {
      // Anonymous users can only see public pitches
      where.visibility = 'PUBLIC';
    }

    if (visibility) {
      where.visibility = visibility;
    }

    // Handle full-text search
    let orderBy: any = { createdAt: 'desc' };
    
    if (q) {
      // For MVP, use ILIKE search instead of full-text search
      where.OR = [
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          summary: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [pitches, total] = await Promise.all([
      this.prisma.pitch.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          entrepreneur: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  location: true,
                },
              },
            },
          },
          attachments: true,
          _count: {
            select: {
              connections: true,
            },
          },
        },
      }),
      this.prisma.pitch.count({ where }),
    ]);

    return {
      data: pitches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string) {
    const pitch = await this.prisma.pitch.findUnique({
      where: { id },
      include: {
        entrepreneur: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                location: true,
                bio: true,
                website: true,
                linkedinUrl: true,
              },
            },
          },
        },
        attachments: true,
        _count: {
          select: {
            connections: true,
          },
        },
      },
    });

    if (!pitch) {
      throw new NotFoundException('Pitch not found');
    }

    // Check visibility permissions
    if (pitch.visibility === 'VERIFIED_INVESTORS' && userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { investor: true },
      });

      if (!user?.investor?.verified) {
        throw new ForbiddenException('Access denied. Verified investor status required.');
      }
    } else if (pitch.visibility === 'BY_REQUEST') {
      // For BY_REQUEST pitches, only the owner or connected users can see
      if (userId !== pitch.entrepreneur.userId) {
        const connection = await this.prisma.connection.findFirst({
          where: {
            pitchId: id,
            recipientId: userId,
            status: 'ACCEPTED',
          },
        });

        if (!connection) {
          throw new ForbiddenException('Access denied. Connection required to view this pitch.');
        }
      }
    }

    return pitch;
  }

  async update(id: string, userId: string, updatePitchDto: UpdatePitchDto) {
    const pitch = await this.prisma.pitch.findUnique({
      where: { id },
      include: {
        entrepreneur: true,
      },
    });

    if (!pitch) {
      throw new NotFoundException('Pitch not found');
    }

    if (pitch.entrepreneur.userId !== userId) {
      throw new ForbiddenException('You can only update your own pitches');
    }

    return this.prisma.pitch.update({
      where: { id },
      data: updatePitchDto,
      include: {
        entrepreneur: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                location: true,
              },
            },
          },
        },
        attachments: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const pitch = await this.prisma.pitch.findUnique({
      where: { id },
      include: {
        entrepreneur: true,
      },
    });

    if (!pitch) {
      throw new NotFoundException('Pitch not found');
    }

    if (pitch.entrepreneur.userId !== userId) {
      throw new ForbiddenException('You can only delete your own pitches');
    }

    return this.prisma.pitch.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getUserPitches(userId: string, page = 1, limit = 20) {
    const entrepreneur = await this.prisma.entrepreneur.findUnique({
      where: { userId },
    });

    if (!entrepreneur) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const skip = (page - 1) * limit;

    const [pitches, total] = await Promise.all([
      this.prisma.pitch.findMany({
        where: {
          entrepreneurId: entrepreneur.id,
          isActive: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true,
          _count: {
            select: {
              connections: true,
            },
          },
        },
      }),
      this.prisma.pitch.count({
        where: {
          entrepreneurId: entrepreneur.id,
          isActive: true,
        },
      }),
    ]);

    return {
      data: pitches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async verifyUser(adminId: string, userId: string) {
    await this.checkAdminPermissions(adminId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'VERIFIED' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async suspendUser(adminId: string, userId: string) {
    await this.checkAdminPermissions(adminId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async verifyEntrepreneur(adminId: string, entrepreneurId: string) {
    await this.checkAdminPermissions(adminId);

    const entrepreneur = await this.prisma.entrepreneur.findUnique({
      where: { id: entrepreneurId },
    });

    if (!entrepreneur) {
      throw new NotFoundException('Entrepreneur not found');
    }

    return this.prisma.entrepreneur.update({
      where: { id: entrepreneurId },
      data: { verified: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async verifyInvestor(adminId: string, investorId: string) {
    await this.checkAdminPermissions(adminId);

    const investor = await this.prisma.investor.findUnique({
      where: { id: investorId },
    });

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    return this.prisma.investor.update({
      where: { id: investorId },
      data: { verified: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deactivatePitch(adminId: string, pitchId: string) {
    await this.checkAdminPermissions(adminId);

    const pitch = await this.prisma.pitch.findUnique({
      where: { id: pitchId },
    });

    if (!pitch) {
      throw new NotFoundException('Pitch not found');
    }

    return this.prisma.pitch.update({
      where: { id: pitchId },
      data: { isActive: false },
      include: {
        entrepreneur: {
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
        },
      },
    });
  }

  async getDashboardStats(adminId: string) {
    await this.checkAdminPermissions(adminId);

    const [
      totalUsers,
      totalEntrepreneurs,
      totalInvestors,
      totalPitches,
      activePitches,
      totalConnections,
      pendingConnections,
      totalMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.entrepreneur.count(),
      this.prisma.investor.count(),
      this.prisma.pitch.count(),
      this.prisma.pitch.count({ where: { isActive: true } }),
      this.prisma.connection.count(),
      this.prisma.connection.count({ where: { status: 'PENDING' } }),
      this.prisma.message.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        entrepreneurs: totalEntrepreneurs,
        investors: totalInvestors,
      },
      pitches: {
        total: totalPitches,
        active: activePitches,
      },
      connections: {
        total: totalConnections,
        pending: pendingConnections,
      },
      messages: {
        total: totalMessages,
      },
    };
  }

  async getUsers(adminId: string, page = 1, limit = 20, status?: string) {
    await this.checkAdminPermissions(adminId);

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          entrepreneur: {
            select: {
              id: true,
              companyName: true,
              verified: true,
            },
          },
          investor: {
            select: {
              id: true,
              verified: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPitches(adminId: string, page = 1, limit = 20, isActive?: boolean) {
    await this.checkAdminPermissions(adminId);

    const skip = (page - 1) * limit;
    const where: any = {};

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [pitches, total] = await Promise.all([
      this.prisma.pitch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          entrepreneur: {
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
          },
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

  private async checkAdminPermissions(adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }
}

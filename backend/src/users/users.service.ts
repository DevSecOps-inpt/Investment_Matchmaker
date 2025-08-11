import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateEntrepreneurProfileDto } from './dto/create-entrepreneur-profile.dto';
import { CreateInvestorProfileDto } from './dto/create-investor-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        linkedinUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        entrepreneur: true,
        investor: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        linkedinUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        entrepreneur: true,
        investor: true,
      },
    });
  }

  async createEntrepreneurProfile(userId: string, profileDto: CreateEntrepreneurProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { entrepreneur: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.entrepreneur) {
      throw new ConflictException('Entrepreneur profile already exists');
    }

    return this.prisma.entrepreneur.create({
      data: {
        userId,
        ...profileDto,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            bio: true,
            location: true,
          },
        },
      },
    });
  }

  async createInvestorProfile(userId: string, profileDto: CreateInvestorProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { investor: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.investor) {
      throw new ConflictException('Investor profile already exists');
    }

    return this.prisma.investor.create({
      data: {
        userId,
        ...profileDto,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            bio: true,
            location: true,
          },
        },
      },
    });
  }

  async updateEntrepreneurProfile(userId: string, profileDto: Partial<CreateEntrepreneurProfileDto>) {
    const entrepreneur = await this.prisma.entrepreneur.findUnique({
      where: { userId },
    });

    if (!entrepreneur) {
      throw new NotFoundException('Entrepreneur profile not found');
    }

    return this.prisma.entrepreneur.update({
      where: { userId },
      data: profileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            bio: true,
            location: true,
          },
        },
      },
    });
  }

  async updateInvestorProfile(userId: string, profileDto: Partial<CreateInvestorProfileDto>) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId },
    });

    if (!investor) {
      throw new NotFoundException('Investor profile not found');
    }

    return this.prisma.investor.update({
      where: { userId },
      data: profileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            bio: true,
            location: true,
          },
        },
      },
    });
  }

  async getEntrepreneurs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [entrepreneurs, total] = await Promise.all([
      this.prisma.entrepreneur.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              bio: true,
              location: true,
            },
          },
          pitches: {
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              summary: true,
              industry: true,
              fundingStage: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.entrepreneur.count(),
    ]);

    return {
      data: entrepreneurs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInvestors(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              bio: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.investor.count(),
    ]);

    return {
      data: investors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

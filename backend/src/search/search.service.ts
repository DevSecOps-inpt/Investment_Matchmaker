import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchPitches(query: string, userId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Build visibility filter based on user role
    let visibilityFilter: any = { visibility: 'PUBLIC' };
    
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { investor: true },
      });

      if (user?.role === 'INVESTOR' && user.investor?.verified) {
        visibilityFilter = {
          visibility: {
            in: ['PUBLIC', 'VERIFIED_INVESTORS'],
          },
        };
      }
    }

    // Use Postgres full-text search for better performance
    let where: any;
    
    if (query.trim()) {
      // Use full-text search when query is provided
      where = {
        AND: [
          { isActive: true },
          visibilityFilter,
          {
            OR: [
              // Full-text search on title and summary
              {
                OR: [
                  {
                    title: {
                      search: query,
                    },
                  },
                  {
                    summary: {
                      search: query,
                    },
                  },
                ],
              },
              // Fallback to ILIKE for industry and partial matches
              {
                industry: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      };
    } else {
      // No query, just filter by visibility
      where = {
        AND: [
          { isActive: true },
          visibilityFilter,
        ],
      };
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
      query,
    };
  }

  async searchUsers(query: string, role?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    let where: any;
    
    if (query.trim()) {
      where = {
        AND: [
          { status: 'ACTIVE' },
          {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      };
    } else {
      where = {
        AND: [
          { status: 'ACTIVE' },
        ],
      };
    }

    if (role) {
      where.AND.push({ role });
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          location: true,
          bio: true,
          entrepreneur: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              verified: true,
            },
          },
          investor: {
            select: {
              id: true,
              investmentFocus: true,
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
      query,
    };
  }

  async getSearchSuggestions(query: string, type: 'pitches' | 'users' = 'pitches') {
    if (type === 'pitches') {
      const suggestions = await this.prisma.pitch.findMany({
        where: {
          AND: [
            { isActive: true },
            { visibility: 'PUBLIC' },
            {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
                {
                  industry: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          industry: true,
        },
      });

      return suggestions.map(pitch => ({
        id: pitch.id,
        text: pitch.title,
        type: 'pitch',
        metadata: { industry: pitch.industry },
      }));
    } else {
      const suggestions = await this.prisma.user.findMany({
        where: {
          AND: [
            { status: 'ACTIVE' },
            {
              OR: [
                {
                  firstName: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          ],
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      return suggestions.map(user => ({
        id: user.id,
        text: `${user.firstName} ${user.lastName}`,
        type: 'user',
        metadata: { role: user.role },
      }));
    }
  }
}

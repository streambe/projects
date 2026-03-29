import type { Prisma, ActivityType } from '.prisma/client';
import { prisma } from '../../prisma/client';
import type { DateRangeQuery } from './reports.schema';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const ReportsService = {
  /**
   * Report RF-25: New clients registered in the given date range.
   */
  async newClients(query: DateRangeQuery) {
    const where: Prisma.ClientWhereInput = { isActive: true };

    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      };
    }

    const clients = await prisma.client.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        howFoundUs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: clients.length,
      clients: clients.map((c: {
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        howFoundUs: string | null;
      }) => ({
        id: c.id,
        fullName: `${c.firstName} ${c.lastName}`,
        createdAt: c.createdAt,
        source: c.howFoundUs ?? null,
      })),
    };
  },

  /**
   * Report RF-26: Activities grouped by responsible user for the given date range.
   */
  async activitiesByUser(query: DateRangeQuery) {
    const where: Prisma.ActivityWhereInput = { status: 'realizada' };

    if (query.from || query.to) {
      where.scheduledAt = {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      };
    }

    // Fetch all activities in range with user info
    const activities = await prisma.activity.findMany({
      where,
      select: {
        type: true,
        responsibleUserId: true,
        responsibleUser: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Aggregate in memory: group by user
    const userMap = new Map<
      string,
      {
        userId: string;
        name: string;
        total: number;
        byType: { llamada: number; reunion: number; tarea: number };
      }
    >();

    for (const activity of activities) {
      const userId = activity.responsibleUserId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          name: activity.responsibleUser.fullName,
          total: 0,
          byType: { llamada: 0, reunion: 0, tarea: 0 } as Record<ActivityType, number>,
        });
      }

      const entry = userMap.get(userId)!;
      entry.total += 1;
      entry.byType[activity.type as ActivityType] += 1;
    }

    const users = Array.from(userMap.values()).sort((a, b) => b.total - a.total);

    return { users };
  },
};

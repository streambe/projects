import type { Prisma } from '.prisma/client';
import { prisma } from '../../prisma/client';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import {
  getPrismaPageParams,
  buildPaginatedResult,
} from '../../shared/utils/pagination';
import type {
  CreateActivityBody,
  UpdateActivityBody,
  CompleteActivityBody,
  ListActivitiesQuery,
} from './activities.schema';

// ---------------------------------------------------------------------------
// Select shape
// ---------------------------------------------------------------------------

const activitySelect = {
  id: true,
  type: true,
  title: true,
  clientId: true,
  opportunityId: true,
  responsibleUserId: true,
  scheduledAt: true,
  dueAt: true,
  status: true,
  summary: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: { id: true, firstName: true, lastName: true },
  },
  responsibleUser: {
    select: { id: true, fullName: true, email: true },
  },
  opportunity: {
    select: { id: true, motoInterest: true, stage: true },
  },
} as const;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const ActivitiesService = {
  /**
   * Creates a new activity.
   * requestingUserId is used as fallback for responsibleUserId when not provided in body.
   */
  async create(data: CreateActivityBody, requestingUserId: string) {
    // Verify client exists and is active
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
      select: { id: true, isActive: true },
    });
    if (!client || !client.isActive) {
      throw new NotFoundError('Cliente no encontrado o inactivo');
    }

    // Resolve responsibleUserId: use body value or fall back to the requesting user
    const responsibleUserId = data.responsibleUserId ?? requestingUserId;

    const user = await prisma.user.findUnique({
      where: { id: responsibleUserId },
      select: { id: true },
    });
    if (!user) throw new NotFoundError('User', responsibleUserId);

    if (data.opportunityId) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: data.opportunityId },
        select: { id: true },
      });
      if (!opportunity) throw new NotFoundError('Opportunity', data.opportunityId);
    }

    const activity = await prisma.activity.create({
      data: {
        type: data.type,
        title: data.title,
        clientId: data.clientId,
        opportunityId: data.opportunityId,
        responsibleUserId,
        scheduledAt: new Date(data.scheduledAt),
        dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
        summary: data.summary,
      },
      select: activitySelect,
    });

    return activity;
  },

  /**
   * Lists activities with optional filters.
   * Ordering: pendiente first (scheduledAt asc), then realizada (updatedAt desc).
   */
  async list(query: ListActivitiesQuery) {
    const { skip, take } = getPrismaPageParams({ page: query.page, limit: query.limit });

    const where: Prisma.ActivityWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.assignedTo) where.responsibleUserId = query.assignedTo;

    if (query.dateFrom || query.dateTo) {
      where.scheduledAt = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    // ?overdue=true — pendiente activities whose dueAt is in the past
    if (query.overdue) {
      where.status = 'pendiente';
      where.dueAt = { lt: new Date() };
    }

    // Fetch all matching activities so we can apply dual-sort (pendiente first then realizada).
    // For large datasets this is done with two separate ordered queries + count.
    const total = await prisma.activity.count({ where });

    // Strategy: fetch paginated results with a compound order that Prisma does not directly
    // support (different order per status value). We use two separate queries to compose
    // the ordered result set and then apply pagination manually.
    const pendienteWhere: Prisma.ActivityWhereInput = { ...where, status: 'pendiente' };
    const realizadaWhere: Prisma.ActivityWhereInput = { ...where, status: 'realizada' };

    // When a status filter is active we restrict accordingly to avoid phantom records.
    const hasSingleStatusFilter =
      where.status === 'pendiente' || where.status === 'realizada' || query.overdue;

    let data;
    if (hasSingleStatusFilter) {
      const effectiveStatus = query.overdue ? 'pendiente' : (where.status as string);
      const orderBy =
        effectiveStatus === 'realizada'
          ? { updatedAt: 'desc' as const }
          : { scheduledAt: 'asc' as const };

      data = await prisma.activity.findMany({
        where,
        select: activitySelect,
        orderBy,
        skip,
        take,
      });
    } else {
      // No status filter: merge pendiente (scheduledAt asc) + realizada (updatedAt desc)
      const [pendiente, realizada] = await Promise.all([
        prisma.activity.findMany({
          where: pendienteWhere,
          select: activitySelect,
          orderBy: { scheduledAt: 'asc' },
        }),
        prisma.activity.findMany({
          where: realizadaWhere,
          select: activitySelect,
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      const merged = [...pendiente, ...realizada];
      data = merged.slice(skip, skip + take);
    }

    return buildPaginatedResult(data, total, { page: query.page, limit: query.limit });
  },

  /**
   * Lists activities for a specific client.
   * Applies the same ordering strategy: pendiente first (scheduledAt asc), realizada last (updatedAt desc).
   */
  async listByClient(clientId: string, query: ListActivitiesQuery) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) throw new NotFoundError('Client', clientId);

    const { skip, take } = getPrismaPageParams({ page: query.page, limit: query.limit });

    const where: Prisma.ActivityWhereInput = { clientId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.assignedTo) where.responsibleUserId = query.assignedTo;

    if (query.dateFrom || query.dateTo) {
      where.scheduledAt = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    if (query.overdue) {
      where.status = 'pendiente';
      where.dueAt = { lt: new Date() };
    }

    const total = await prisma.activity.count({ where });

    const hasSingleStatusFilter =
      where.status === 'pendiente' || where.status === 'realizada' || query.overdue;

    let data;
    if (hasSingleStatusFilter) {
      const effectiveStatus = query.overdue ? 'pendiente' : (where.status as string);
      const orderBy =
        effectiveStatus === 'realizada'
          ? { updatedAt: 'desc' as const }
          : { scheduledAt: 'asc' as const };

      data = await prisma.activity.findMany({
        where,
        select: activitySelect,
        orderBy,
        skip,
        take,
      });
    } else {
      const pendienteWhere: Prisma.ActivityWhereInput = { ...where, status: 'pendiente' };
      const realizadaWhere: Prisma.ActivityWhereInput = { ...where, status: 'realizada' };

      const [pendiente, realizada] = await Promise.all([
        prisma.activity.findMany({
          where: pendienteWhere,
          select: activitySelect,
          orderBy: { scheduledAt: 'asc' },
        }),
        prisma.activity.findMany({
          where: realizadaWhere,
          select: activitySelect,
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      const merged = [...pendiente, ...realizada];
      data = merged.slice(skip, skip + take);
    }

    return buildPaginatedResult(data, total, { page: query.page, limit: query.limit });
  },

  /**
   * Updates an activity's fields.
   */
  async update(id: string, data: UpdateActivityBody) {
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!activity) throw new NotFoundError('Activity', id);

    if (data.responsibleUserId) {
      const user = await prisma.user.findUnique({
        where: { id: data.responsibleUserId },
        select: { id: true },
      });
      if (!user) throw new NotFoundError('User', data.responsibleUserId);
    }

    if (data.opportunityId) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: data.opportunityId },
        select: { id: true },
      });
      if (!opportunity) throw new NotFoundError('Opportunity', data.opportunityId);
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.opportunityId !== undefined && { opportunityId: data.opportunityId }),
        ...(data.responsibleUserId !== undefined && { responsibleUserId: data.responsibleUserId }),
        ...(data.scheduledAt !== undefined && { scheduledAt: new Date(data.scheduledAt) }),
        ...(data.dueAt !== undefined && { dueAt: new Date(data.dueAt) }),
        ...(data.summary !== undefined && { summary: data.summary }),
      },
      select: activitySelect,
    });

    return updated;
  },

  /**
   * Marks an activity as realizada, optionally adding completion notes.
   * Throws 400 if the activity is already completed.
   */
  async complete(id: string, data: CompleteActivityBody) {
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!activity) throw new NotFoundError('Activity', id);

    if (activity.status === 'realizada') {
      throw new ValidationError('La actividad ya fue marcada como realizada');
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        status: 'realizada',
        ...(data.summary !== undefined && { summary: data.summary }),
      },
      select: activitySelect,
    });

    return updated;
  },

  /**
   * Deletes an activity.
   */
  async delete(id: string) {
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!activity) throw new NotFoundError('Activity', id);

    await prisma.activity.delete({ where: { id } });
  },
};

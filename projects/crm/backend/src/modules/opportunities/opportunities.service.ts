import type { Prisma } from '.prisma/client';
import { prisma } from '../../prisma/client';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import {
  getPrismaPageParams,
  buildPaginatedResult,
} from '../../shared/utils/pagination';
import type {
  CreateOpportunityBody,
  UpdateOpportunityBody,
  ChangeStageBody,
  ListOpportunitiesQuery,
} from './opportunities.schema';

// ---------------------------------------------------------------------------
// Select shapes
// ---------------------------------------------------------------------------

const opportunitySelect = {
  id: true,
  clientId: true,
  assignedUserId: true,
  motoInterest: true,
  stage: true,
  result: true,
  lossReason: true,
  isOpen: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: { id: true, firstName: true, lastName: true, phonePrimary: true },
  },
  assignedUser: {
    select: { id: true, fullName: true, email: true },
  },
} as const;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const OpportunitiesService = {
  /**
   * Creates a new opportunity linked to a client.
   */
  async create(data: CreateOpportunityBody) {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
      select: { id: true },
    });
    if (!client) throw new NotFoundError('Client', data.clientId);

    // Verify assigned user exists if provided
    if (data.assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: data.assignedUserId },
        select: { id: true },
      });
      if (!user) throw new NotFoundError('User', data.assignedUserId);
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        clientId: data.clientId,
        assignedUserId: data.assignedUserId,
        motoInterest: data.motoInterest,
        stage: data.stage,
      },
      select: opportunitySelect,
    });

    return opportunity;
  },

  /**
   * Lists all opportunities (for kanban) with optional stage and isOpen filters.
   */
  async list(query: ListOpportunitiesQuery) {
    const { skip, take } = getPrismaPageParams({ page: query.page, limit: query.limit });

    const where: Prisma.OpportunityWhereInput = {};
    if (query.stage) where.stage = query.stage;
    if (query.isOpen !== undefined) where.isOpen = query.isOpen;

    const [total, data] = await prisma.$transaction([
      prisma.opportunity.count({ where }),
      prisma.opportunity.findMany({
        where,
        select: opportunitySelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return buildPaginatedResult(data, total, { page: query.page, limit: query.limit });
  },

  /**
   * Lists opportunities belonging to a specific client.
   */
  async listByClient(clientId: string, query: ListOpportunitiesQuery) {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) throw new NotFoundError('Client', clientId);

    const { skip, take } = getPrismaPageParams({ page: query.page, limit: query.limit });

    const where: Prisma.OpportunityWhereInput = { clientId };
    if (query.stage) where.stage = query.stage;
    if (query.isOpen !== undefined) where.isOpen = query.isOpen;

    const [total, data] = await prisma.$transaction([
      prisma.opportunity.count({ where }),
      prisma.opportunity.findMany({
        where,
        select: opportunitySelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return buildPaginatedResult(data, total, { page: query.page, limit: query.limit });
  },

  /**
   * Changes the stage of an opportunity and records the change in history.
   * If stage = cierre, closes the opportunity and stores the result.
   */
  async changeStage(id: string, data: ChangeStageBody, changedByUserId: string) {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      select: { id: true, stage: true, isOpen: true },
    });
    if (!opportunity) throw new NotFoundError('Opportunity', id);

    if (!opportunity.isOpen) {
      throw new ValidationError('Cannot change stage of a closed opportunity');
    }

    const isCierre = data.stage === 'cierre';

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Record history entry
      await tx.opportunityHistory.create({
        data: {
          opportunityId: id,
          changedByUserId,
          fromStage: opportunity.stage,
          toStage: data.stage,
        },
      });

      // Update opportunity
      return tx.opportunity.update({
        where: { id },
        data: {
          stage: data.stage,
          ...(isCierre && {
            isOpen: false,
            result: data.result,
            lossReason: data.result === 'perdido' ? data.lostReason : null,
          }),
        },
        select: {
          ...opportunitySelect,
          history: {
            select: {
              id: true,
              fromStage: true,
              toStage: true,
              changedAt: true,
              changedByUser: { select: { id: true, fullName: true } },
            },
            orderBy: { changedAt: 'desc' },
          },
        },
      });
    });

    return updated;
  },

  /**
   * Updates general fields of an opportunity (not stage).
   */
  async update(id: string, data: UpdateOpportunityBody) {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!opportunity) throw new NotFoundError('Opportunity', id);

    if (data.assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: data.assignedUserId },
        select: { id: true },
      });
      if (!user) throw new NotFoundError('User', data.assignedUserId);
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        ...(data.assignedUserId !== undefined && { assignedUserId: data.assignedUserId }),
        ...(data.motoInterest !== undefined && { motoInterest: data.motoInterest }),
      },
      select: opportunitySelect,
    });

    return updated;
  },

  /**
   * Deletes an opportunity and its associated history records.
   */
  async delete(id: string) {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!opportunity) throw new NotFoundError('Opportunity', id);

    // Delete related history first (foreign key constraint)
    await prisma.$transaction([
      prisma.opportunityHistory.deleteMany({ where: { opportunityId: id } }),
      prisma.opportunity.delete({ where: { id } }),
    ]);
  },
};

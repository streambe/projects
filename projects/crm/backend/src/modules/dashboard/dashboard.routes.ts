import type { FastifyPluginAsync } from 'fastify';
import { AppError } from '../../shared/utils/errors';

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/dashboard/stats
   * Returns aggregated KPIs for the CRM dashboard.
   */
  fastify.get(
    '/stats',
    { preHandler: [fastify.authenticate] },
    async (_request, reply) => {
      try {
        const prisma = fastify.prisma;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Run independent queries in parallel for performance
        const [
          totalClients,
          newClientsThisMonth,
          openOpportunities,
          pendingActivities,
          overdueActivities,
          wonOpportunities,
          totalClosedOpportunities,
          recentActivitiesRaw,
          pipelineRaw,
        ] = await Promise.all([
          // totalClients: active clients
          prisma.client.count({
            where: { isActive: true },
          }),

          // newClientsThisMonth: created since first day of current month
          prisma.client.count({
            where: {
              createdAt: { gte: firstDayOfMonth },
            },
          }),

          // openOpportunities
          prisma.opportunity.count({
            where: { isOpen: true },
          }),

          // pendingActivities
          prisma.activity.count({
            where: { status: 'pendiente' },
          }),

          // overdueActivities: pending AND (dueAt < now OR (dueAt is null AND scheduledAt < now))
          prisma.activity.count({
            where: {
              status: 'pendiente',
              OR: [
                { dueAt: { not: null, lt: now } },
                { dueAt: null, scheduledAt: { lt: now } },
              ],
            },
          }),

          // won opportunities (for conversion rate)
          prisma.opportunity.count({
            where: { result: 'ganado' },
          }),

          // total closed opportunities (for conversion rate)
          prisma.opportunity.count({
            where: { isOpen: false },
          }),

          // recentActivities: last 5 with client info
          prisma.activity.findMany({
            orderBy: { scheduledAt: 'desc' },
            take: 5,
            select: {
              id: true,
              type: true,
              title: true,
              scheduledAt: true,
              status: true,
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          }),

          // pipelineByStage: open opportunities grouped by stage
          prisma.opportunity.groupBy({
            by: ['stage'],
            where: { isOpen: true },
            _count: { id: true },
          }),
        ]);

        // Compute conversion rate
        const conversionRate =
          totalClosedOpportunities > 0
            ? Math.round((wonOpportunities / totalClosedOpportunities) * 1000) / 10
            : 0;

        // Map recent activities
        const recentActivities = recentActivitiesRaw.map((a: typeof recentActivitiesRaw[number]) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          clientName: `${a.client.firstName} ${a.client.lastName}`,
          scheduledAt: a.scheduledAt.toISOString(),
          status: a.status,
        }));

        // Build pipeline map with all stages defaulting to 0
        const pipelineByStage: Record<string, number> = {
          consulta: 0,
          prueba_manejo: 0,
          presupuesto: 0,
          cierre: 0,
        };
        for (const row of pipelineRaw) {
          pipelineByStage[row.stage] = row._count.id;
        }

        return reply.code(200).send({
          data: {
            totalClients,
            newClientsThisMonth,
            openOpportunities,
            pendingActivities,
            overdueActivities,
            conversionRate,
            recentActivities,
            pipelineByStage,
          },
        });
      } catch (err) {
        if (err instanceof AppError) {
          return reply.code(err.statusCode).send({
            error: { code: err.name.toUpperCase(), message: err.message },
          });
        }
        throw err;
      }
    },
  );
};

export default dashboardRoutes;

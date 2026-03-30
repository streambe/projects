import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import dashboardRoutes from './dashboard.routes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMockPrisma(overrides: Record<string, unknown> = {}) {
  return {
    client: {
      count: overrides['clientCount'] ?? vi.fn().mockResolvedValue(0),
    },
    opportunity: {
      count: overrides['opportunityCount'] ?? vi.fn().mockResolvedValue(0),
      groupBy: overrides['opportunityGroupBy'] ?? vi.fn().mockResolvedValue([]),
    },
    activity: {
      count: overrides['activityCount'] ?? vi.fn().mockResolvedValue(0),
      findMany: overrides['activityFindMany'] ?? vi.fn().mockResolvedValue([]),
    },
  };
}

async function buildTestApp(prismaMock: ReturnType<typeof buildMockPrisma>) {
  const app = Fastify({ logger: false });

  // Decorate with mock prisma and a passthrough authenticate
  app.decorate('prisma', prismaMock);
  app.decorate('authenticate', async () => {
    /* noop — allows all requests */
  });

  await app.register(dashboardRoutes, { prefix: '/dashboard' });
  await app.ready();
  return app;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /dashboard/stats', () => {
  // -----------------------------------------------------------------------
  // Happy path: empty database returns all zeros
  // -----------------------------------------------------------------------
  describe('happy path - empty database', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
      const clientCount = vi.fn().mockResolvedValue(0);
      const opportunityCount = vi.fn().mockResolvedValue(0);
      const opportunityGroupBy = vi.fn().mockResolvedValue([]);
      const activityCount = vi.fn().mockResolvedValue(0);
      const activityFindMany = vi.fn().mockResolvedValue([]);

      app = await buildTestApp(
        buildMockPrisma({
          clientCount,
          opportunityCount,
          opportunityGroupBy,
          activityCount,
          activityFindMany,
        }),
      );
    });

    afterAll(async () => {
      await app.close();
    });

    it('returns 200 with zeroed stats', async () => {
      const res = await app.inject({ method: 'GET', url: '/dashboard/stats' });
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.payload);
      expect(body.data).toBeDefined();
      expect(body.data.totalClients).toBe(0);
      expect(body.data.newClientsThisMonth).toBe(0);
      expect(body.data.openOpportunities).toBe(0);
      expect(body.data.pendingActivities).toBe(0);
      expect(body.data.overdueActivities).toBe(0);
      expect(body.data.conversionRate).toBe(0);
      expect(body.data.recentActivities).toEqual([]);
      expect(body.data.pipelineByStage).toEqual({
        consulta: 0,
        prueba_manejo: 0,
        presupuesto: 0,
        cierre: 0,
      });
    });
  });

  // -----------------------------------------------------------------------
  // Happy path: database with data
  // -----------------------------------------------------------------------
  describe('happy path - with data', () => {
    let app: FastifyInstance;
    let data: Record<string, unknown>;

    beforeAll(async () => {
      // client.count will be called twice: totalClients and newClientsThisMonth
      const clientCount = vi
        .fn()
        .mockResolvedValueOnce(42) // totalClients
        .mockResolvedValueOnce(7); // newClientsThisMonth

      // opportunity.count called 3 times: openOpportunities, wonOpportunities, totalClosedOpportunities
      const opportunityCount = vi
        .fn()
        .mockResolvedValueOnce(10) // openOpportunities
        .mockResolvedValueOnce(15) // wonOpportunities (result=ganado)
        .mockResolvedValueOnce(20); // totalClosedOpportunities

      const opportunityGroupBy = vi.fn().mockResolvedValue([
        { stage: 'consulta', _count: { id: 5 } },
        { stage: 'presupuesto', _count: { id: 3 } },
        { stage: 'cierre', _count: { id: 2 } },
      ]);

      // activity.count called 2 times: pendingActivities, overdueActivities
      const activityCount = vi
        .fn()
        .mockResolvedValueOnce(8) // pendingActivities
        .mockResolvedValueOnce(3); // overdueActivities

      const activityFindMany = vi.fn().mockResolvedValue([
        {
          id: 'act-1',
          type: 'llamada',
          title: 'Follow up call',
          scheduledAt: new Date('2026-03-28T10:00:00Z'),
          status: 'pendiente',
          client: { firstName: 'Juan', lastName: 'Perez' },
        },
        {
          id: 'act-2',
          type: 'reunion',
          title: 'Demo meeting',
          scheduledAt: new Date('2026-03-27T14:00:00Z'),
          status: 'realizada',
          client: { firstName: 'Maria', lastName: 'Lopez' },
        },
      ]);

      app = await buildTestApp(
        buildMockPrisma({
          clientCount,
          opportunityCount,
          opportunityGroupBy,
          activityCount,
          activityFindMany,
        }),
      );

      // Call endpoint once — mockResolvedValueOnce values are consumed in order
      const res = await app.inject({ method: 'GET', url: '/dashboard/stats' });
      expect(res.statusCode).toBe(200);
      data = JSON.parse(res.payload).data;
    });

    afterAll(async () => {
      await app.close();
    });

    it('returns correct client counts', () => {
      expect(data.totalClients).toBe(42);
      expect(data.newClientsThisMonth).toBe(7);
    });

    it('returns correct opportunity and activity counts', () => {
      expect(data.openOpportunities).toBe(10);
      expect(data.pendingActivities).toBe(8);
      expect(data.overdueActivities).toBe(3);
    });

    it('calculates conversionRate correctly (15/20 = 75.0)', () => {
      expect(data.conversionRate).toBe(75);
    });

    it('maps recentActivities with clientName', () => {
      const activities = data.recentActivities as Array<Record<string, unknown>>;
      expect(activities).toHaveLength(2);
      expect(activities[0]).toMatchObject({
        id: 'act-1',
        type: 'llamada',
        title: 'Follow up call',
        clientName: 'Juan Perez',
        status: 'pendiente',
      });
      expect(activities[1]).toMatchObject({ clientName: 'Maria Lopez' });
    });

    it('builds pipelineByStage with missing stages defaulting to 0', () => {
      expect(data.pipelineByStage).toEqual({
        consulta: 5,
        prueba_manejo: 0,
        presupuesto: 3,
        cierre: 2,
      });
    });
  });

  // -----------------------------------------------------------------------
  // Edge case: conversionRate when no closed opportunities (division by zero)
  // -----------------------------------------------------------------------
  describe('edge case - no closed opportunities', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
      const clientCount = vi.fn().mockResolvedValue(1);
      const opportunityCount = vi
        .fn()
        .mockResolvedValueOnce(5)  // openOpportunities
        .mockResolvedValueOnce(0)  // wonOpportunities
        .mockResolvedValueOnce(0); // totalClosedOpportunities = 0 → avoid divide by zero
      const opportunityGroupBy = vi.fn().mockResolvedValue([]);
      const activityCount = vi.fn().mockResolvedValue(0);
      const activityFindMany = vi.fn().mockResolvedValue([]);

      app = await buildTestApp(
        buildMockPrisma({
          clientCount,
          opportunityCount,
          opportunityGroupBy,
          activityCount,
          activityFindMany,
        }),
      );
    });

    afterAll(async () => {
      await app.close();
    });

    it('returns conversionRate 0 when no closed opportunities', async () => {
      const res = await app.inject({ method: 'GET', url: '/dashboard/stats' });
      const { data } = JSON.parse(res.payload);
      expect(data.conversionRate).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // Error handling: Prisma throws an unexpected error
  // -----------------------------------------------------------------------
  describe('error - prisma throws', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
      const clientCount = vi.fn().mockRejectedValue(new Error('DB connection lost'));
      const opportunityCount = vi.fn().mockResolvedValue(0);
      const opportunityGroupBy = vi.fn().mockResolvedValue([]);
      const activityCount = vi.fn().mockResolvedValue(0);
      const activityFindMany = vi.fn().mockResolvedValue([]);

      app = await buildTestApp(
        buildMockPrisma({
          clientCount,
          opportunityCount,
          opportunityGroupBy,
          activityCount,
          activityFindMany,
        }),
      );
    });

    afterAll(async () => {
      await app.close();
    });

    it('returns 500 when Prisma throws', async () => {
      const res = await app.inject({ method: 'GET', url: '/dashboard/stats' });
      expect(res.statusCode).toBe(500);
    });
  });

  // -----------------------------------------------------------------------
  // 401: unauthenticated request
  // -----------------------------------------------------------------------
  describe('authentication required', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
      const fastifyApp = Fastify({ logger: false });
      const prismaMock = buildMockPrisma();

      fastifyApp.decorate('prisma', prismaMock);
      // authenticate that rejects
      fastifyApp.decorate('authenticate', async (_req: unknown, reply: { code: (n: number) => { send: (b: unknown) => void } }) => {
        reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Missing token' });
      });

      await fastifyApp.register(dashboardRoutes, { prefix: '/dashboard' });
      await fastifyApp.ready();
      app = fastifyApp;
    });

    afterAll(async () => {
      await app.close();
    });

    it('returns 401 when not authenticated', async () => {
      const res = await app.inject({ method: 'GET', url: '/dashboard/stats' });
      expect(res.statusCode).toBe(401);
    });
  });

  // -----------------------------------------------------------------------
  // 404: wrong route
  // -----------------------------------------------------------------------
  describe('route not found', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
      app = await buildTestApp(buildMockPrisma());
    });

    afterAll(async () => {
      await app.close();
    });

    it('returns 404 for non-existing dashboard routes', async () => {
      const res = await app.inject({ method: 'GET', url: '/dashboard/nonexistent' });
      expect(res.statusCode).toBe(404);
    });

    it('returns 404 for POST method on stats', async () => {
      const res = await app.inject({ method: 'POST', url: '/dashboard/stats' });
      expect(res.statusCode).toBe(404);
    });
  });
});

import type { Prisma } from '.prisma/client';
import { prisma } from '../../prisma/client';
import { NotFoundError, ConflictError } from '../../shared/utils/errors';
import {
  getPrismaPageParams,
  buildPaginatedResult,
} from '../../shared/utils/pagination';
import type { CreateClientBody, UpdateClientBody, ListClientsQuery } from './clients.schema';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DuplicateConflict {
  id: string;
  fullName: string;
  field: 'dni' | 'phonePrimary';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Checks whether another client (excluding `excludeId`) already holds the
 * provided DNI or phonePrimary. Returns the first conflict found or null.
 */
async function findDuplicate(
  dni: string | undefined,
  phonePrimary: string | undefined,
  excludeId?: string,
): Promise<DuplicateConflict | null> {
  if (dni) {
    const byDni = await prisma.client.findUnique({
      where: { dni },
      select: { id: true, firstName: true, lastName: true },
    });
    if (byDni && byDni.id !== excludeId) {
      return {
        id: byDni.id,
        fullName: `${byDni.firstName} ${byDni.lastName}`,
        field: 'dni',
      };
    }
  }

  if (phonePrimary) {
    const byPhone = await prisma.client.findUnique({
      where: { phonePrimary },
      select: { id: true, firstName: true, lastName: true },
    });
    if (byPhone && byPhone.id !== excludeId) {
      return {
        id: byPhone.id,
        fullName: `${byPhone.firstName} ${byPhone.lastName}`,
        field: 'phonePrimary',
      };
    }
  }

  return null;
}

/**
 * Same as findDuplicate but operates within a Prisma transaction context.
 * Used inside prisma.$transaction to ensure the check and create are atomic.
 */
async function findDuplicateInTx(
  tx: Prisma.TransactionClient,
  dni: string | undefined,
  phonePrimary: string | undefined,
  excludeId?: string,
): Promise<DuplicateConflict | null> {
  if (dni) {
    const byDni = await tx.client.findUnique({
      where: { dni },
      select: { id: true, firstName: true, lastName: true },
    });
    if (byDni && byDni.id !== excludeId) {
      return {
        id: byDni.id,
        fullName: `${byDni.firstName} ${byDni.lastName}`,
        field: 'dni',
      };
    }
  }

  if (phonePrimary) {
    const byPhone = await tx.client.findUnique({
      where: { phonePrimary },
      select: { id: true, firstName: true, lastName: true },
    });
    if (byPhone && byPhone.id !== excludeId) {
      return {
        id: byPhone.id,
        fullName: `${byPhone.firstName} ${byPhone.lastName}`,
        field: 'phonePrimary',
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Client select shape (reused across queries)
// ---------------------------------------------------------------------------

const clientSelect = {
  id: true,
  firstName: true,
  lastName: true,
  dni: true,
  phonePrimary: true,
  phoneAlt: true,
  email: true,
  whatsappNumber: true,
  city: true,
  province: true,
  birthDate: true,
  howFoundUs: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const ClientsService = {
  /**
   * Creates a new client. Returns null as conflict when unique constraints
   * would be violated — the caller must check the returned conflict.
   */
  async create(data: CreateClientBody): Promise<{
    client: object | null;
    conflict: DuplicateConflict | null;
  }> {
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const conflict = await findDuplicateInTx(tx, data.dni, data.phonePrimary);
        if (conflict) return { client: null, conflict };

        const client = await tx.client.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            dni: data.dni,
            phonePrimary: data.phonePrimary,
            phoneAlt: data.phoneAlt,
            email: data.email,
            whatsappNumber: data.whatsappNumber,
            city: data.city,
            province: data.province,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            howFoundUs: data.howFoundUs,
            notes: data.notes,
          },
          select: clientSelect,
        });

        return { client, conflict: null };
      });

      return result;
    } catch (err: unknown) {
      // P2002 = Unique constraint violation — another concurrent request won the race
      if (
        err !== null &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        const prismaErr = err as { meta?: { target?: string[] } };
        const field = prismaErr.meta?.target?.includes('phonePrimary')
          ? 'phonePrimary'
          : 'dni';
        const conflictingClient = await prisma.client.findFirst({
          where: field === 'dni' ? { dni: data.dni } : { phonePrimary: data.phonePrimary },
          select: { id: true, firstName: true, lastName: true },
        });
        if (conflictingClient) {
          throw new ConflictError(
            `A client with this ${field} already exists: ${conflictingClient.firstName} ${conflictingClient.lastName} (id: ${conflictingClient.id})`,
          );
        }
        throw new ConflictError(`A client with this ${field} already exists`);
      }
      throw err;
    }
  },

  /**
   * Returns a paginated list of clients with optional text search and
   * isActive filter.
   */
  async list(query: ListClientsQuery) {
    const { skip, take } = getPrismaPageParams({ page: query.page, limit: query.limit });

    const where: Prisma.ClientWhereInput = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { dni: { contains: term, mode: 'insensitive' } },
        { phonePrimary: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await prisma.$transaction([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        select: clientSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return buildPaginatedResult(data, total, { page: query.page, limit: query.limit });
  },

  /**
   * Returns a single client with their recent opportunities and activities.
   */
  async findById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        ...clientSelect,
        opportunities: {
          select: {
            id: true,
            motoInterest: true,
            stage: true,
            result: true,
            lossReason: true,
            isOpen: true,
            createdAt: true,
            updatedAt: true,
            assignedUser: {
              select: { id: true, fullName: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        activities: {
          select: {
            id: true,
            type: true,
            title: true,
            scheduledAt: true,
            dueAt: true,
            status: true,
            summary: true,
            createdAt: true,
            responsibleUser: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) throw new NotFoundError('Client', id);
    return client;
  },

  /**
   * Updates a client. Re-validates duplicate DNI/phone if those fields change.
   */
  async update(id: string, data: UpdateClientBody): Promise<{
    client: object | null;
    conflict: DuplicateConflict | null;
  }> {
    // Verify existence first
    const existing = await prisma.client.findUnique({
      where: { id },
      select: { id: true, dni: true, phonePrimary: true },
    });
    if (!existing) throw new NotFoundError('Client', id);

    // Only check duplicates if those fields are being changed
    const dniToCheck = data.dni !== undefined && data.dni !== existing.dni ? data.dni : undefined;
    const phoneToCheck =
      data.phonePrimary !== undefined && data.phonePrimary !== existing.phonePrimary
        ? data.phonePrimary
        : undefined;

    if (dniToCheck || phoneToCheck) {
      const conflict = await findDuplicate(dniToCheck, phoneToCheck, id);
      if (conflict) return { client: null, conflict };
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.dni !== undefined && { dni: data.dni }),
        ...(data.phonePrimary !== undefined && { phonePrimary: data.phonePrimary }),
        ...(data.phoneAlt !== undefined && { phoneAlt: data.phoneAlt }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.birthDate !== undefined && { birthDate: new Date(data.birthDate) }),
        ...(data.howFoundUs !== undefined && { howFoundUs: data.howFoundUs }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      select: clientSelect,
    });

    return { client, conflict: null };
  },

  /**
   * Soft-deletes a client by setting isActive = false.
   */
  async softDelete(id: string) {
    const existing = await prisma.client.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError('Client', id);

    await prisma.client.update({
      where: { id },
      data: { isActive: false },
    });
  },
};

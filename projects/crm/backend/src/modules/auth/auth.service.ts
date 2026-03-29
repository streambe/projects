import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma/client';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../shared/utils/errors';
import type { RegisterBody, JwtPayload, UpdateUserBody } from './auth.schema';

const BCRYPT_ROUNDS = 12;

export const AuthService = {
  /**
   * Validates email + password and returns the user record.
   * Throws UnauthorizedError if credentials are invalid.
   */
  async validateCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      // Use same error message to avoid user enumeration
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return user;
  },

  /**
   * Creates a new user. Throws ConflictError if email already exists.
   */
  async createUser(data: RegisterBody) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  },

  /**
   * Updates a user's editable fields (fullName, email, password).
   * Throws NotFoundError if user does not exist.
   * Throws ConflictError if the new email is already taken by another user.
   */
  async updateUser(id: string, data: UpdateUserBody) {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError('User', id);

    if (data.email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
        select: { id: true },
      });
      if (emailTaken) throw new ConflictError('A user with this email already exists');
    }

    const updateData: {
      fullName?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  },

  /**
   * Soft-deletes (deactivates) a user by setting isActive = false.
   * Throws NotFoundError if user does not exist.
   */
  async deactivateUser(id: string) {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError('User', id);

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Returns all active users. Used to populate responsible user selectors in the UI.
   */
  async listUsers() {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      orderBy: { fullName: 'asc' },
    });
    return users;
  },

  /**
   * Builds the JWT payload for a given user.
   */
  buildTokenPayload(user: {
    id: string;
    email: string;
    fullName: string;
  }): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  },
};

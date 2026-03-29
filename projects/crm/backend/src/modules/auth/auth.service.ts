import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma/client';
import { UnauthorizedError, ConflictError } from '../../shared/utils/errors';
import type { RegisterBody, JwtPayload } from './auth.schema';

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

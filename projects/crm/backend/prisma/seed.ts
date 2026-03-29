/**
 * Prisma seed script — creates an initial admin user for development.
 * Run with: npx tsx prisma/seed.ts
 * Or via: npm run prisma:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user (change password before deploying to production)
  const adminEmail = 'admin@ciudadmoto.com';
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin1234!', 12);
    const admin = await prisma.user.create({
      data: {
        fullName: 'Administrador',
        email: adminEmail,
        passwordHash,
        isActive: true,
      },
    });
    console.log(`Created admin user: ${admin.email} (id: ${admin.id})`);
    console.log('Default password: Admin1234! — CHANGE THIS before deploying!');
  } else {
    console.log(`Admin user already exists: ${existing.email}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

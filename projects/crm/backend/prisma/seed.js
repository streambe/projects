const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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
    console.log('Created admin user: ' + admin.email + ' (id: ' + admin.id + ')');
  } else {
    console.log('Admin user already exists: ' + existing.email);
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

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = ['ESTUDIANTE', 'AUXILIAR', 'ADMIN'];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  const statuses = ['ACTIVO', 'SUSPENDIDO', 'ELIMINADO'];
  for (const status of statuses) {
    await prisma.status.upsert({
      where: { name: status },
      update: {},
      create: { name: status },
    });
  }

  const bcrypt = require('bcrypt');
  const password = await bcrypt.hash('password', 10);

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const auxRole = await prisma.role.findUnique({ where: { name: 'AUXILIAR' } });
  const estRole = await prisma.role.findUnique({ where: { name: 'ESTUDIANTE' } });
  const activeStatus = await prisma.status.findUnique({ where: { name: 'ACTIVO' } });

  if (adminRole && activeStatus) {
    await prisma.user.upsert({
      where: { email: 'admin@mail.com' },
      update: {},
      create: { name: 'Administrador', email: 'admin@mail.com', password, roleId: adminRole.id, statusId: activeStatus.id }
    });
  }

  if (auxRole && activeStatus) {
    await prisma.user.upsert({
      where: { email: 'aux@mail.com' },
      update: {},
      create: { name: 'Auxiliar', email: 'aux@mail.com', password, roleId: auxRole.id, statusId: activeStatus.id }
    });
  }

  if (estRole && activeStatus) {
    await prisma.user.upsert({
      where: { email: 'estudiante@mail.com' },
      update: {},
      create: { name: 'Estudiante', email: 'estudiante@mail.com', password, roleId: estRole.id, statusId: activeStatus.id }
    });
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

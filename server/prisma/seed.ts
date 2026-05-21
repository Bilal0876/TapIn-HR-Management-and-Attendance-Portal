import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const company = await prisma.company.create({
    data: {
      name: 'TechCorp Industry Standards',
      timezone: 'Asia/Karachi',
    },
  });

  const superAdmin = await prisma.employee.create({
    data: {
      companyId: company.id,
      name: 'Super Admin',
      email: 'superadmin@company.com',
      passwordHash,
      role: Role.SUPER_ADMIN,
      mustChangePassword: true,
      profile: {
        create: {
          employeeCode: 'EMP-000',
          designation: 'CEO',
          department: 'Executive',
          joiningDate: new Date('2024-01-01'),
        },
      },
    },
  });

  const admin = await prisma.employee.create({
    data: {
      companyId: company.id,
      name: 'HR Admin',
      email: 'admin@company.com',
      passwordHash,
      role: Role.ADMIN,
      mustChangePassword: true,
      profile: {
        create: {
          employeeCode: 'EMP-001',
          designation: 'HR Manager',
          department: 'Human Resources',
          joiningDate: new Date('2024-01-01'),
        },
      },
    },
  });

  const employee1 = await prisma.employee.create({
    data: {
      companyId: company.id,
      name: 'Jane Doe',
      email: 'jane@company.com',
      passwordHash,
      role: Role.EMPLOYEE,
      mustChangePassword: true,
      profile: {
        create: {
          employeeCode: 'EMP-002',
          designation: 'Software Engineer',
          department: 'Engineering',
          joiningDate: new Date('2024-02-15'),
        },
      },
    },
  });

  console.log(`Seeded company: ${company.name}`);
  console.log(`Seeded Super Admin: ${superAdmin.email}`);
  console.log(`Seeded Admin: ${admin.email}`);
  console.log(`Seeded Employee: ${employee1.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

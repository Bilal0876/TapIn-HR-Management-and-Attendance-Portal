const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const records = await prisma.attendanceRecord.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { employee: true }
  });
  console.log('Last 10 records:', JSON.stringify(records, null, 2));
  await prisma.$disconnect();
}

check();

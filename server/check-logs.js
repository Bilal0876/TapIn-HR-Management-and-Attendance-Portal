const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { employee: true }
  });
  console.log('Last 10 logs:', JSON.stringify(logs, null, 2));
  await prisma.$disconnect();
}

check();

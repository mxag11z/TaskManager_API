//Script para crear un nuevo usuario
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; 
const prisma = new PrismaClient();

async function main() {
  
  let existingUser = await prisma.user.findFirst();

  if (!existingUser) {
    existingUser = await prisma.user.create({
      data: {
        name: 'ExampleUser',
        email: 'user@example.com',
      },
    });
    console.log('Se creó un nuevo usuario.');
  }

  const userId = existingUser.id;

  const statuses = [
    { name: 'TODO', position: 1, isDefault: true, userId: userId },
    { name: 'In Progress', position: 2, isDefault: true, userId: userId },
    { name: 'Done', position: 3, isDefault: true, userId: userId },
  ];

  for (const statusData of statuses) {
    await prisma.taskStatus.upsert({
      where: {
        userId_name: { userId: statusData.userId, name: statusData.name },
      },
      update: {
        position: statusData.position,
        isDefault: statusData.isDefault,
      },
      create: {
        name: statusData.name,
        position: statusData.position,
        isDefault: statusData.isDefault,
        userId: statusData.userId,
      },
    });
  }

  console.log('Base de datos poblada con status!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
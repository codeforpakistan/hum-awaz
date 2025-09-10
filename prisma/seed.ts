import { PrismaClient } from '@prisma/client'
import { seedProduction } from '@/prisma/seeds/production'
import { seedDevelopment } from '@/prisma/seeds/development'

const prisma = new PrismaClient()

async function main() {
  await seedProduction(prisma)
  await seedDevelopment(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

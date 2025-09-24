// prisma/seed-prod.ts
import { PrismaClient } from '@prisma/client'
import { seedProduction } from '@/prisma/seeds/production'

const prisma = new PrismaClient()

async function main() {
  await seedProduction(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

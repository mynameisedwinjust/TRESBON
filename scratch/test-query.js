const { PrismaClient } = require('./src/generated/client')
const prisma = new PrismaClient()

async function test() {
  try {
    const users = await prisma.user.findMany({
      include: { customer: true }
    })
    
    for (const u of users) {
      const nameKey = u.fullName || u.phone
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { recordedById: u.id },
            { recordedBy: nameKey },
            { recordedBy: u.fullName || undefined },
            { recordedBy: u.phone }
          ]
        },
        select: { totalAmount: true }
      })
      console.log(`User ${u.phone}: ${orders.length} orders`)
    }
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

test()

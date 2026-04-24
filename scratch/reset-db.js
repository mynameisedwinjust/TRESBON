const { PrismaClient } = require('../src/generated/client')
const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('Starting database reset...')
  try {
    // 1. Delete all Delivery Tasks
    const delTasks = await prisma.deliveryTask.deleteMany({})
    console.log(`Deleted ${delTasks.count} delivery tasks.`)

    // 2. Delete all Payments
    const delPayments = await prisma.payment.deleteMany({})
    console.log(`Deleted ${delPayments.count} payments.`)

    // 3. Delete all Order Items
    const delOrderItems = await prisma.orderItem.deleteMany({})
    console.log(`Deleted ${delOrderItems.count} order items.`)

    // 4. Delete all Orders
    const delOrders = await prisma.order.deleteMany({})
    console.log(`Deleted ${delOrders.count} orders.`)

    // 5. Delete all Customers
    // Note: We might want to keep users who are staff
    const delCustomers = await prisma.customer.deleteMany({})
    console.log(`Deleted ${delCustomers.count} customers.`)

    // 6. Delete all Expenses
    const delExpenses = await prisma.expense.deleteMany({})
    console.log(`Deleted ${delExpenses.count} expenses.`)

    // 7. Delete Users who are only customers
    const delUsers = await prisma.user.deleteMany({
      where: {
        role: 'customer'
      }
    })
    console.log(`Deleted ${delUsers.count} customer user accounts.`)

    console.log('Database reset successfully completed!')
  } catch (error) {
    console.error('Error resetting database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()

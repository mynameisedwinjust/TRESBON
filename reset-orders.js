const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting all order data...');

  // Delete DeliveryTasks first to avoid foreign key constraint errors
  const deletedTasks = await prisma.deliveryTask.deleteMany({});
  console.log(`Deleted ${deletedTasks.count} delivery tasks.`);

  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`Deleted ${deletedPayments.count} payments.`);

  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`Deleted ${deletedOrderItems.count} order items.`);

  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`Deleted ${deletedOrders.count} orders.`);

  console.log('All order data has been fully reset successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

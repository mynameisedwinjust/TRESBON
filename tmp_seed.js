const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seed() {
  const employees = [
    {phone: '0782054470', name: 'Jams', role: 'cashier'},
    {phone: '0781840783', name: 'Fida', role: 'cleaner'},
    {phone: '0789136257', name: 'Mbabazi', role: 'supervisor'},
    {phone: '0790023659', name: 'Umutesi', role: 'delivery'}
  ];
  
  for (const emp of employees) {
    try {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await prisma.user.upsert({
        where: { phone: emp.phone },
        update: { fullName: emp.name, role: emp.role },
        create: {
          phone: emp.phone,
          fullName: emp.name,
          role: emp.role,
          password: hashedPassword,
          isActive: true
        }
      });
      console.log('Processed:', emp.name);
    } catch (e) {
      console.error('Error processing:', emp.name, e.message);
    }
  }
}

seed().finally(() => prisma.$disconnect());

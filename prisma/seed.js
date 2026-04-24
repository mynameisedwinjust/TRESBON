require('dotenv').config()
const { PrismaClient } = require('../src/generated/client')

const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // 1. Create Default Admin User
    const adminEmail = 'admin@tresbon.com'
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            fullName: 'TrèsBon Admin',
            role: 'admin',
            isActive: true,
        },
    })
    console.log(`✅ Admin user created: ${admin.email}`)

    // 2. Create Default Branch
    const branch = await prisma.branch.upsert({
        where: { id: 'main-branch' }, // Placeholder ID for seeding
        update: {},
        create: {
            id: 'main-branch',
            name: 'Main Branch',
            address: 'Kicukiro Center, Kigali, Rwanda',
            phone: '+250 790 002 060',
            email: 'tresbondrycleaners01@gmail.com',
            managerId: admin.id,
        },
    })
    console.log(`✅ Default branch created: ${branch.name}`)

    // 3. Create Default Services
    const services = [
        { name: "Advanced stain removal", type: "stain_removal", basePrice: 0, description: "Specialized treatment for tough stains" },
        { name: "Wedding gowns and special garment care", type: "dry_cleaning", basePrice: 0, description: "Specialized care for wedding gowns, umushanana, and delicate garments" },
        { name: "Corporate, hotel, and institutional laundry services", type: "washing", basePrice: 0, description: "Comprehensive laundry services for institutions, hotels, and general clothing" },
        { name: "Iron & Pressing services", type: "ironing", basePrice: 0, description: "Professional ironing and pressing service" },
        { name: "Express Services", type: "washing", basePrice: 0, description: "Priority processing with 24-hour turnaround" },
    ]

    for (const service of services) {
        await prisma.service.upsert({
            where: { id: service.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') },
            update: { basePrice: service.basePrice, type: service.type, description: service.description },
            create: {
                id: service.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                ...service,
                isActive: true,
            },
        })
    }
    console.log('✅ Default services created')

    console.log('\n🎉 Database seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

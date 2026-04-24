import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        await requireAdmin()
        const { searchParams } = new URL(request.url)

        // Parse Date Range
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')

        // Default to last 30 days if not specified
        const endDate = endDateParam ? new Date(endDateParam) : new Date()
        endDate.setHours(23, 59, 59, 999)

        const startDate = startDateParam ? new Date(startDateParam) : new Date()
        if (!startDateParam) {
            startDate.setMonth(startDate.getMonth() - 1)
        }
        startDate.setHours(0, 0, 0, 0)

        const where = {
            createdAt: {
                gte: startDate,
                lte: endDate
            },
            status: { not: 'cancelled' }
        }

        // 1. Total Revenue & Orders (within range)
        const statsResult = await prisma.order.aggregate({
            where,
            _sum: { totalAmount: true },
            _count: { id: true },
            _avg: { totalAmount: true }
        })

        const totalRevenue = statsResult._sum.totalAmount || 0
        const totalOrders = statsResult._count.id || 0
        const avgOrderValue = statsResult._avg.totalAmount || 0

        // 2. Top Services
        const topServicesResult = await prisma.orderItem.groupBy({
            by: ['itemName'],
            _sum: { quantity: true, totalPrice: true },
            where: {
                order: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'cancelled' }
                }
            },
            orderBy: {
                _sum: { totalPrice: 'desc' }
            },
            take: 5
        })

        const topServices = topServicesResult.map(s => ({
            name: s.itemName,
            count: s._sum.quantity || 0,
            revenue: s._sum.totalPrice || 0
        }))

        // 3. Customer Stats
        const totalCustomers = await prisma.customer.count()
        const newCustomersCount = await prisma.customer.count({
            where: {
                createdAt: { gte: startDate, lte: endDate }
            }
        })

        // Returning customers: ordered in period but were registered before period started
        const returningCustomers = await prisma.customer.count({
            where: {
                createdAt: { lt: startDate },
                orders: {
                    some: {
                        createdAt: { gte: startDate, lte: endDate }
                    }
                }
            }
        })

        // 4. Daily Revenue Trend
        const dailyOrders = await prisma.order.findMany({
            where,
            select: { createdAt: true, totalAmount: true }
        })

        const dailyMap: Record<string, number> = {}
        dailyOrders.forEach(o => {
            const date = o.createdAt.toISOString().split('T')[0]
            dailyMap[date] = (dailyMap[date] || 0) + o.totalAmount
        })

        const dailyRevenue = Object.entries(dailyMap)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date))

        // 5. Payment Stats
        const payments = await prisma.payment.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['completed', 'paid'] } // Include both for safety if status varies
            }
        })

        const totalCash = payments
            .filter(p => p.method?.toLowerCase() === 'cash')
            .reduce((sum, p) => sum + p.amount, 0)

        const totalPhone = payments
            .filter(p => ['mobile_money', 'momo', 'phone'].includes(p.method?.toLowerCase() || ''))
            .reduce((sum, p) => sum + p.amount, 0)

        const totalPaymentsCombined = totalCash + totalPhone

        // 6. Detailed Orders
        const detailedOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                customer: true,
                _count: { select: { items: true } }
            }
        })

        const detailedOrdersFormatted = detailedOrders.map(o => ({
            orderNumber: o.orderNumber,
            customerName: o.customer?.name || "Member User",
            date: o.createdAt,
            totalAmount: o.totalAmount,
            paidAmount: o.paidAmount,
            status: o.status,
            itemsCount: o._count.items
        }))

        const totalLoyaltyPointsCount = await prisma.order.count({
            where: { status: { not: 'cancelled' } }
        })

        return NextResponse.json({
            totalRevenue: totalRevenue,
            totalOrders: totalOrders,
            totalCustomers: totalCustomers,
            averageOrderValue: avgOrderValue,
            totalCash,
            totalPhone,
            totalPaymentsCombined,
            topServices: topServices,
            customerStats: {
                newCustomers: newCustomersCount,
                returningCustomers,
                totalLoyaltyPoints: totalLoyaltyPointsCount
            },
            staffPerformance: [],
            dailyRevenue: dailyRevenue,
            detailedOrders: detailedOrdersFormatted
        })

    } catch (error: any) {
        console.error("Reports API Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate reports" },
            { status: 500 }
        )
    }
}

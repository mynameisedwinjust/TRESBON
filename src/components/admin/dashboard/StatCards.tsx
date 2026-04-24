import React, { memo } from "react"
import { Users, ShoppingBag, DollarSign, Package, Truck, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatCardsProps {
    stats: {
        totalCustomers: number
        totalOrders: number
        totalRevenue: number
        pendingOrders: number
        activeDeliveries: number
        recentCustomers: number
        pendingPayments: number
        unpaidDeliveries: number
        activeStaff?: number
    }
    userRole?: string
}

export const StatCards = memo(({ stats, userRole = "employee" }: StatCardsProps) => {
    const isAdminOrSupervisor = userRole === "admin" || userRole === "supervisor"

    const statConfig = [
        {
            title: "Active Staff",
            value: (stats.activeStaff || 0).toLocaleString(),
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            visible: isAdminOrSupervisor
        },
        {
            title: "Total Customers",
            value: stats.totalCustomers.toLocaleString(),
            icon: Users,
            color: "text-laundry-primary",
            bgColor: "bg-laundry-primary/10",
            visible: isAdminOrSupervisor
        },
        {
            title: "Total Orders",
            value: stats.totalOrders.toLocaleString(),
            icon: ShoppingBag,
            color: "text-green-600",
            bgColor: "bg-green-100",
            visible: true
        },
        {
            title: "Total Revenue",
            value: `RWF ${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            visible: isAdminOrSupervisor
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders.toLocaleString(),
            icon: AlertCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            visible: true
        },
        {
            title: "Verify Payments",
            value: stats.pendingPayments.toLocaleString(),
            icon: DollarSign,
            color: "text-amber-600",
            bgColor: "bg-amber-100",
            visible: isAdminOrSupervisor
        },
        {
            title: "Unpaid Clothes",
            value: (stats.unpaidDeliveries || 0).toLocaleString(),
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-100",
            visible: true
        },
    ].filter(s => s.visible)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {statConfig.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card key={index} className="p-8 border-none shadow-sm rounded-2xl bg-white hover:shadow-xl hover:shadow-laundry-primary/5 transition-all duration-500 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                                <p className="text-3xl font-extrabold text-secondary mt-2 tracking-tight group-hover:text-laundry-primary transition-colors">{stat.value}</p>
                            </div>
                            <div className={`${stat.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`h-7 w-7 ${stat.color}`} />
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
})

StatCards.displayName = "StatCards"

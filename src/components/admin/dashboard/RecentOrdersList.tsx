import React, { memo } from "react"
import Link from "next/link"
import { ShoppingBag, AlertCircle, DollarSign, PieChart, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

interface RecentOrdersListProps {
    recentOrders: any[]
    filter: "all" | "pending_action" | "needs_payment" | "partially_paid"
    setFilter: (filter: "all" | "pending_action" | "needs_payment" | "partially_paid") => void
    approveOrder: (id: string, number: string) => void
}

export const RecentOrdersList = memo(({ recentOrders, filter, setFilter, approveOrder }: RecentOrdersListProps) => {
    return (
        <Card className="p-8 border-none shadow-sm rounded-2xl bg-white">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-extrabold text-secondary tracking-tight">Recent Orders</h2>
                <Link href="/admin/orders">
                    <Button variant="ghost" size="sm" className="text-laundry-primary hover:bg-laundry-primary/5 font-bold uppercase tracking-widest text-[10px]">
                        View All
                    </Button>
                </Link>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className={cn(
                        "rounded-full px-6 font-bold text-[10px] uppercase tracking-widest h-9",
                        filter === "all" ? "bg-laundry-primary text-white shadow-md shadow-laundry-primary/20" : "border-gray-100 text-gray-400 hover:text-laundry-primary hover:border-laundry-primary/30"
                    )}
                >
                    All
                </Button>
                <Button
                    variant={filter === "pending_action" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setFilter("pending_action")}
                    className={cn(
                        "rounded-full px-6 font-bold text-[10px] uppercase tracking-widest h-9 border-transparent transition-all duration-300",
                        filter === "pending_action" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "border-gray-100 text-gray-400 hover:text-orange-500 hover:border-orange-500/30"
                    )}
                >
                    <AlertCircle className="h-3 w-3 mr-2" />
                    Needs Action
                </Button>
                <Button
                    variant={filter === "needs_payment" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setFilter("needs_payment")}
                    className={cn(
                        "rounded-full px-6 font-bold text-[10px] uppercase tracking-widest h-9 border-transparent transition-all duration-300",
                        filter === "needs_payment" ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/20" : "border-gray-100 text-gray-400 hover:text-yellow-600 hover:border-yellow-600/30"
                    )}
                >
                    <DollarSign className="h-3 w-3 mr-2" />
                    Verify Payment
                </Button>
                <Button
                    variant={filter === "partially_paid" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setFilter("partially_paid")}
                    className={cn(
                        "rounded-full px-6 font-bold text-[10px] uppercase tracking-widest h-9 border-transparent transition-all duration-300",
                        filter === "partially_paid" ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-600/30"
                    )}
                >
                    <PieChart className="h-3 w-3 mr-2" />
                    Partially Paid
                </Button>
            </div>
            {recentOrders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-300 gap-4">
                    <ShoppingBag className="h-12 w-12 opacity-20" />
                    <p className="font-medium">No orders yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recentOrders.map((order: any) => {
                        const orderId = order._id || order.id
                        const orderNumber = order.orderNumber || order.order_number
                        const isLeaving = ["ready", "completed", "delivered"].includes(order.status)
                        const isUnpaid = (Number(order.paidAmount || order.paid_amount) || 0) < (Number(order.totalAmount || order.total_amount) || 0)
                        const shouldHighlightRed = isLeaving && isUnpaid

                        return (
                            <div key={orderId} className={cn(
                                "group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border",
                                shouldHighlightRed 
                                    ? "bg-red-50/50 border-red-200 hover:bg-red-50 hover:shadow-red-100/50 hover:shadow-lg" 
                                    : "bg-gray-50/50 border-transparent hover:bg-white hover:shadow-md hover:border-laundry-primary/10"
                            )}>
                                <Link href={`/admin/orders/${orderId}`} className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <Check className={cn(
                                            "h-3 w-3 stroke-[4px]",
                                            shouldHighlightRed ? "text-red-500" :
                                            order.status === "accepted" ? "text-blue-500" :
                                            (order.status === "in_process" || order.status === "partially_paid") ? "text-yellow-500" :
                                            (order.status === "ready" || order.status === "completed") ? "text-green-500" :
                                            order.status === "delivered" ? "text-purple-500" :
                                            "text-gray-400"
                                        )} />
                                        <span className="font-bold text-secondary text-lg">
                                            #{orderNumber ? orderNumber.split('-').pop() : '000'}
                                        </span>
                                        <span
                                            className={cn(
                                                "px-3 py-1 text-[10px] font-extrabold rounded-full tracking-wider uppercase",
                                                shouldHighlightRed 
                                                    ? "bg-red-200 text-red-700 animate-pulse" 
                                                    : order.status === "accepted"
                                                        ? "bg-blue-100 text-blue-600"
                                                        : (order.status === "in_process" || order.status === "partially_paid")
                                                            ? "bg-yellow-100 text-yellow-600"
                                                            : (order.status === "ready" || order.status === "completed")
                                                                ? "bg-green-100 text-green-600"
                                                                : order.status === "delivered"
                                                                    ? "bg-purple-100 text-purple-600"
                                                                    : "bg-gray-100 text-gray-600"
                                            )}
                                        >
                                            {shouldHighlightRed ? "LEFT UNPAID" : order.status === "completed" ? "COMPLETED" : (order.status === "in_process" || order.status === "partially_paid") ? "IN PROGRESS" : order.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium mt-1">
                                        {order.customer?.name || order.customers?.name || "Walk-in"} • <span className="text-secondary font-bold">{formatCurrency(order.totalAmount || order.total_amount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {formatDate(order.createdAt || order.created_at)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">Created by:</span>
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">{order.recordedBy || "Gasasira"}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            )}
        </Card>
    )
})

RecentOrdersList.displayName = "RecentOrdersList"

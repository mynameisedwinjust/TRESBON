import React, { memo } from "react"
import Link from "next/link"
import { Users, ShoppingBag, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecentCustomersListProps {
    recentCustomers: any[]
    pendingOrdersCount: number
}

export const RecentCustomersList = memo(({ recentCustomers, pendingOrdersCount }: RecentCustomersListProps) => {
    return (
        <Card className="p-8 border-none shadow-sm rounded-2xl bg-white">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-extrabold text-secondary tracking-tight">Recent Customers</h2>
                <Link href="/admin/customers">
                    <Button variant="ghost" size="sm" className="text-laundry-primary hover:bg-laundry-primary/5 font-bold uppercase tracking-widest text-[10px]">
                        View All
                    </Button>
                </Link>
            </div>
            {recentCustomers.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400">
                    No recent customers
                </div>
            ) : (
                <div className="space-y-4 mb-8">
                    {recentCustomers.map((customer: any) => (
                        <Link key={customer._id || customer.id} href={`/admin/customers/${customer._id || customer.id}`}>
                            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-laundry-primary/10 cursor-pointer group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-laundry-primary/10 rounded-full flex items-center justify-center group-hover:bg-laundry-primary/20 transition-colors">
                                            <Users className="h-5 w-5 text-laundry-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-secondary">{customer.name || "Unknown"}</span>
                                                <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-green-100 text-green-600 uppercase tracking-widest">
                                                    New
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium mt-0.5">
                                                {customer.email || customer.phone || "No contact"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="pt-8 border-t border-gray-100">
                <h2 className="text-xl font-extrabold text-secondary tracking-tight mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pendingOrdersCount > 0 && (
                        <Link href="/admin/orders?status=received" className="sm:col-span-2">
                            <Button className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 px-6 shadow-lg shadow-orange-500/20">
                                <AlertCircle className="h-5 w-5 mr-3" />
                                <span className="font-bold">Review {pendingOrdersCount} Pending Orders</span>
                            </Button>
                        </Link>
                    )}
                    <Link href="/admin/orders/new">
                        <Button variant="outline" className="w-full justify-start border-gray-100 hover:border-laundry-primary hover:bg-laundry-primary/5 rounded-2xl h-14 px-6 transition-all duration-300">
                            <ShoppingBag className="h-5 w-5 mr-3 text-laundry-primary" />
                            <span className="font-bold text-gray-700">New Order</span>
                        </Button>
                    </Link>
                    <Link href="/admin/customers">
                        <Button variant="outline" className="w-full justify-start border-gray-100 hover:border-laundry-primary hover:bg-laundry-primary/5 rounded-2xl h-14 px-6 transition-all duration-300">
                            <Users className="h-5 w-5 mr-3 text-laundry-primary" />
                            <span className="font-bold text-gray-700">Customers</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    )
})

RecentCustomersList.displayName = "RecentCustomersList"

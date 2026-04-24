"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { StatCards } from "@/components/admin/dashboard/StatCards"
import { RecentOrdersList } from "@/components/admin/dashboard/RecentOrdersList"
import { RecentCustomersList } from "@/components/admin/dashboard/RecentCustomersList"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Check } from "lucide-react"

// Lazy load historical charts to improve initial page load performance
const DashboardCharts = dynamic(
  () => import("@/components/admin/dashboard/DashboardCharts").then(mod => mod.DashboardCharts),
  {
    loading: () => <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Charts...</div>,
    ssr: false
  }
)



export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeDeliveries: 0,
    recentCustomers: 0,
    pendingPayments: 0,
    unpaidDeliveries: 0,
    activeStaff: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [serviceData, setServiceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending_action" | "needs_payment" | "partially_paid">("all")
  
  const [pendingItemsOrders, setPendingItemsOrders] = useState<any[]>([])
  const [partiallyPaidOrders, setPartiallyPaidOrders] = useState<any[]>([])
  const [completedOrders, setCompletedOrders] = useState<any[]>([])
  const [unpaidDeliveriesOrders, setUnpaidDeliveriesOrders] = useState<any[]>([])
  
  const pendingActionOrders = useMemo(() => {
    return recentOrders.filter(o => o.status === "in_process" || o.status === "partially_paid" || o.payments?.some((p: any) => p.status === "pending"))
  }, [recentOrders])

  const loadDashboardData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true)

      const [statsRes, ordersRes, customersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/orders?limit=100"),
        fetch("/api/admin/customers?recent=true&limit=5")
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(prev => ({
          ...prev,
          totalCustomers: statsData.totalCustomers || 0,
          totalOrders: statsData.totalOrders || 0,
          totalRevenue: statsData.totalRevenue || 0,
          pendingOrders: statsData.pendingOrders || 0,
          activeDeliveries: statsData.activeDeliveries || 0,
          recentCustomers: statsData.recentCustomers || 0,
          pendingPayments: statsData.pendingPayments || 0,
          activeStaff: statsData.activeStaff || 0,
        }))
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        if (ordersData.orders) {
          const sorted = ordersData.orders.sort((a: any, b: any) => {
            const aActive = a.status === "in_process" || a.status === "partially_paid";
            const bActive = b.status === "in_process" || b.status === "partially_paid";
            if (aActive && !bActive) return -1
            if (!aActive && bActive) return 1
            return new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
          })

          let filtered = sorted
          if (filter === "pending_action") {
            filtered = sorted.filter((o: any) => {
              if (o.status !== "in_process" && o.status !== "partially_paid") return false
              return !(o.payments?.length > 0) || !(o.deliveryTasks?.length > 0)
            })
          } else if (filter === "needs_payment") {
            filtered = sorted.filter((o: any) =>
              o.payments?.some((p: any) => p.status === "pending" && p.method !== "cash")
            )
          } else if (filter === "partially_paid") {
            filtered = sorted.filter((o: any) => o.paidAmount > 0 && o.paidAmount < o.totalAmount && o.status !== "cancelled")
          }
          // We limit recentOrders to 10 for the table, but use all 100 for calculations
          setRecentOrders(filtered.slice(0, 10))

          const allUnpaidLeaving = sorted.filter((o: any) => 
            ["ready", "completed", "delivered"].includes(o.status) && 
            (Number(o.paidAmount) || 0) < (Number(o.totalAmount) || 0)
          );

          setPendingItemsOrders(sorted.filter((o: any) => 
            (o.status === "in_process" || o.status === "partially_paid") && 
            !(["ready", "completed", "delivered"].includes(o.status))
          ))
          
          setPartiallyPaidOrders(sorted.filter((o: any) => 
            o.paidAmount > 0 && o.paidAmount < o.totalAmount && 
            o.status !== "cancelled" && 
            !(["ready", "completed", "delivered"].includes(o.status))
          ))
          
          setCompletedOrders(sorted.filter((o: any) => 
            ["ready", "completed", "delivered"].includes(o.status) && 
            (Number(o.paidAmount) || 0) >= (Number(o.totalAmount) || 0)
          ))

          setUnpaidDeliveriesOrders(allUnpaidLeaving)
          
          const unpaidDeliveries = allUnpaidLeaving.length;
          setStats(prev => ({ ...prev, unpaidDeliveries }))

          // Optimize chart data preparation
          const last7DaysStrings = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            return date.toISOString().split('T')[0]
          })

          const chartDataMap = last7DaysStrings.reduce((acc, date) => {
            acc[date] = { date, orders: 0, revenue: 0 }
            return acc
          }, {} as Record<string, any>)

          sorted.forEach((order: any) => {
            const orderDate = new Date(order.createdAt || order.created_at).toISOString().split('T')[0]
            if (chartDataMap[orderDate]) {
              chartDataMap[orderDate].orders += 1
              chartDataMap[orderDate].revenue += Number(order.totalAmount || order.total_amount || 0)
            }
          })

          setChartData(last7DaysStrings.map(date => ({
            ...chartDataMap[date],
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          })))

          const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {}
          sorted.forEach((order: any) => {
            order.order_items?.forEach((item: any) => {
              const serviceName = item.services?.name || item.serviceName || 'Service'
              if (!serviceMap[serviceName]) serviceMap[serviceName] = { name: serviceName, count: 0, revenue: 0 }
              serviceMap[serviceName].count += item.quantity || 1
              serviceMap[serviceName].revenue += Number(item.total_price || 0)
            })
          })
          setServiceData(Object.values(serviceMap).sort((a, b) => b.count - a.count).slice(0, 5))
        }
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setRecentCustomers(customersData.customers || [])
      }

    } catch (error: any) {
      console.error("Dashboard error:", error)
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Some dashboard data could not be refreshed",
      })
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [filter, toast])

  const approveOrder = useCallback(async (orderId: string, orderNumber: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to approve order")
      }

      toast({
        title: "Order Approved",
        description: `Order ${orderNumber} has been approved successfully.`,
      })

      loadDashboardData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve order",
      })
    }
  }, [loadDashboardData, toast])

  useEffect(() => {
    loadDashboardData(true)
    const interval = setInterval(() => loadDashboardData(false), 30000)
    return () => clearInterval(interval)
  }, [loadDashboardData])

  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "employee"
  const isAdminOrSupervisor = userRole === "admin" || userRole === "supervisor"
  
  const userName = userRole === "admin" || session?.user?.name === "Admin"
    ? "Gasasira" 
    : session?.user?.name || "Staff"

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-12 w-12 border-4 border-laundry-primary/20 border-t-laundry-primary rounded-full animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 bg-gradient-to-br from-blue-50 via-white to-blue-50/20 p-8 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <svg className="w-48 h-48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <p className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-2">TrèsBon {isAdminOrSupervisor ? 'Admin Control' : 'Operations'} Panel</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block drop-shadow-sm">{userName}</span>!
          </h1>
          <p className="text-gray-500 font-medium text-sm max-w-2xl">
            {isAdminOrSupervisor 
              ? "Here's an overview of your laundry operations, recent orders, and financial statistics for today."
              : "Here's an overview of your current laundry operations and recent orders."}
          </p>
        </div>
      </div>


      {/* NEW SECTION: Dashboard Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {/* Pending Items/Orders Panel */}
        <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl shadow-md w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-yellow-800 flex items-center gap-3 mb-4 uppercase tracking-wider relative z-10">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <span className="flex-1">In Progress ({pendingItemsOrders.length})</span>
            <Link href="/admin/orders" className="text-xs font-bold text-yellow-700 bg-yellow-200/50 hover:bg-yellow-200 py-1 px-3 rounded-full no-underline transition-colors uppercase tracking-widest cursor-pointer mr-2">
              View All
            </Link>
          </h2>
          <div className="space-y-1.5 relative z-10 max-h-[500px] min-h-[200px] overflow-y-auto pr-2 custom-scrollbar flex flex-col">
            {pendingItemsOrders.length === 0 ? (
              <p className="text-sm text-yellow-600 font-medium italic">No in-progress orders currently.</p>
            ) : (
              pendingItemsOrders.map((order) => (
                <div key={order._id || order.id} onClick={() => window.location.href = `/admin/orders/${order._id || order.id}`} className="bg-white p-2.5 rounded-lg shadow-sm border border-yellow-200 flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-yellow-500 stroke-[4px]" />
                      <h3 className="font-black text-gray-800 text-sm">Order #{order.orderNumber}</h3>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5 uppercase tracking-widest">{order.customer?.name || 'Walk-in'} • {order.items?.length || 0} Items</p>
                    <p className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider inline-block mt-1">By: {order.recordedBy || 'Gasasira'}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-yellow-200 text-yellow-800 uppercase tracking-widest whitespace-nowrap">
                      In Progress
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Partially Paid Orders Panel */}
        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl shadow-md w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-blue-800 flex items-center gap-3 mb-4 uppercase tracking-wider relative z-10">
             <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="flex-1">Partially Paid ({partiallyPaidOrders.length})</span>
            <Link href="/admin/orders" className="text-xs font-bold text-blue-700 bg-blue-200/50 hover:bg-blue-200 py-1 px-3 rounded-full no-underline transition-colors uppercase tracking-widest cursor-pointer mr-2">
              View All
            </Link>
          </h2>
          <div className="space-y-1.5 relative z-10 max-h-[500px] min-h-[200px] overflow-y-auto pr-2 custom-scrollbar flex flex-col">
            {partiallyPaidOrders.length === 0 ? (
              <p className="text-sm text-blue-600 font-medium italic">No partially paid orders currently.</p>
            ) : (
              partiallyPaidOrders.map((order) => (
                <div key={order._id || order.id} 
                  onClick={() => window.location.href = `/admin/orders/${order._id || order.id}`} 
                  className={`p-2.5 rounded-lg shadow-sm border flex flex-col gap-1.5 cursor-pointer transition-colors ${
                    ["ready", "completed", "delivered"].includes(order.status)
                      ? "bg-red-50 border-red-300 hover:bg-red-100"
                      : "bg-white border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-blue-500 stroke-[4px]" />
                      <h3 className="font-black text-gray-800 text-sm">Order #{order.orderNumber}</h3>
                    </div>
                    <div className="flex gap-1.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${
                                 ["ready", "completed", "delivered"].includes(order.status) ? "bg-red-200 text-red-700 animate-pulse" :
                                 order.status === "accepted" ? "bg-blue-100 text-blue-600" :
                               (order.status === "in_process" || order.status === "partially_paid") ? "bg-yellow-100 text-yellow-600" :
                               "bg-gray-100 text-gray-600"
                      }`}>
                        {["ready", "completed", "delivered"].includes(order.status) ? "LEFT UNPAID" : (order.status === "in_process" || order.status === "partially_paid") ? "In Progress" : order.status.replace("_", " ")}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-200 text-blue-800 uppercase tracking-widest whitespace-nowrap">
                        Partial Payment
                      </span>
                    </div>
                  </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {order.customer?.name || order.customerName || 'Walk-in'} • {order.items?.length || order.order_items?.length || 0} Items
                        <div className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider inline-block mt-1 ml-2">By: {order.recordedBy || 'Gasasira'}</div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div className="text-[10px] font-bold text-gray-400 line-through">GHS {typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount || '0.00'}</div>
                        <div className="text-[10px] font-black text-blue-700">Paid: GHS {typeof order.paidAmount === 'number' ? order.paidAmount.toFixed(2) : order.paidAmount || '0.00'}</div>
                        <div className="text-[10px] font-bold text-red-600 uppercase animate-pulse">Due: GHS {typeof order.totalAmount === 'number' && typeof order.paidAmount === 'number' ? (order.totalAmount - order.paidAmount).toFixed(2) : '0.00'}</div>
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Completed Orders Panel */}
        <div className="bg-green-50 border-2 border-green-200 p-6 rounded-2xl shadow-md w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-green-800 flex items-center gap-3 mb-4 uppercase tracking-wider relative z-10">
             <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="flex-1">Completed ({completedOrders.length})</span>
            <Link href="/admin/orders" className="text-xs font-bold text-green-700 bg-green-200/50 hover:bg-green-200 py-1 px-3 rounded-full no-underline transition-colors uppercase tracking-widest cursor-pointer mr-2">
              View All
            </Link>
          </h2>
          <div className="space-y-1.5 relative z-10 max-h-[500px] min-h-[200px] overflow-y-auto pr-2 custom-scrollbar flex flex-col">
            {completedOrders.length === 0 ? (
              <p className="text-sm text-green-600 font-medium italic">No fully paid completed orders.</p>
            ) : (
              completedOrders.slice(0, 50).map((order) => (
                  <div 
                    key={order._id || order.id} 
                    onClick={() => window.location.href = `/admin/orders/${order._id || order.id}`} 
                    className="bg-white p-2.5 rounded-lg shadow-sm border border-green-200 flex items-center justify-between cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500 stroke-[4px]" />
                        <h3 className="font-black text-gray-800 text-sm">Order #{order.orderNumber}</h3>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 mt-0.5 uppercase tracking-widest">{order.customer?.name || 'Walk-in'} • {order.items?.length || 0} Items</p>
                      <p className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider inline-block mt-1">By: {order.recordedBy || 'Gasasira'}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-200 text-green-800 uppercase tracking-widest whitespace-nowrap">
                        Done
                      </span>
                    </div>
                  </div>
              ))
            )}
          </div>
        </div>

        {/* Unpaid Leaving (Debt) Panel */}
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl shadow-md w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-red-800 flex items-center gap-3 mb-4 uppercase tracking-wider relative z-10">
             <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="flex-1 text-sm xl:text-base">Unpaid Clothes ({unpaidDeliveriesOrders.length})</span>
            <Link href="/admin/orders" className="text-xs font-bold text-red-700 bg-red-200/50 hover:bg-red-200 py-1 px-3 rounded-full no-underline transition-colors uppercase tracking-widest cursor-pointer mr-2">
              View All
            </Link>
          </h2>
          <div className="space-y-1.5 relative z-10 max-h-[500px] min-h-[200px] overflow-y-auto pr-2 custom-scrollbar flex flex-col">
            {unpaidDeliveriesOrders.length === 0 ? (
              <p className="text-sm text-red-600 font-medium italic">No unpaid clothes currently.</p>
            ) : (
              unpaidDeliveriesOrders.map((order) => {
                const isUnpaid = (Number(order.paidAmount) || 0) < (Number(order.totalAmount) || 0);
                return (
                  <div 
                    key={order._id || order.id} 
                    onClick={() => window.location.href = `/admin/orders/${order._id || order.id}`} 
                    className="bg-white p-2.5 rounded-lg shadow-sm border border-red-200 flex flex-col gap-1.5 cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-red-500 stroke-[4px]" />
                        <h3 className="font-black text-gray-800 text-sm">Order #{order.orderNumber}</h3>
                      </div>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-200 text-red-800 uppercase tracking-widest whitespace-nowrap animate-pulse">
                        LEFT UNPAID
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {order.customer?.name || 'Walk-in'} • {order.items?.length || 0} Items
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-red-600">DUE: GHS {(Number(order.totalAmount) - (Number(order.paidAmount) || 0)).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <StatCards stats={stats as any} userRole={userRole} />

      {isAdminOrSupervisor && (
        <DashboardCharts chartData={chartData} serviceData={serviceData} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentOrdersList
          recentOrders={recentOrders}
          filter={filter}
          setFilter={setFilter}
          approveOrder={approveOrder}
        />
        <RecentCustomersList
          recentCustomers={recentCustomers}
          pendingOrdersCount={stats.pendingOrders}
        />
      </div>
    </div>
  )
}

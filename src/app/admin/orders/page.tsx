"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Search,
  Eye,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Check
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useSession } from "next-auth/react"

interface Order {
  id: string
  order_number: string
  customer_id: string | null
  status: string
  total_amount: number
  paid_amount: number
  created_at: string
  recordedBy?: string | null
  customer?: {
    name: string
    phone: string | null
  }
}



export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, order_number: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "employee"
  const isSuperiorAdmin = userRole === "admin" || userRole === "supervisor"

  useEffect(() => {
    loadOrders()

    // TODO: Set up polling or WebSocket for real-time updates (migrated from Supabase)
    // Poll for updates every 30 seconds
    const interval = setInterval(loadOrders, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const executeDelete = async () => {
    if (!confirmDelete) return

    setDeleting(confirmDelete.id)
    try {
      const response = await fetch(`/api/admin/orders/${confirmDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete order')
      }

      toast({
        title: 'Success',
        description: 'Order deleted successfully',
      })

      loadOrders()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete order',
      })
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  // State for rendering

  const loadOrders = async () => {
    try {
      console.log("[Orders Page] Fetching orders from /api/admin/orders")
      const response = await fetch("/api/admin/orders")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[Orders Page] API error:", response.status, errorData)
        throw new Error(errorData.error || "Failed to load orders")
      }

      const data = await response.json()
      console.log("[Orders Page] Received orders data:", data)
      const ordersData = data.orders || []

      // Transform the data to match expected format
      const transformedOrders = ordersData.map((order: any) => ({
        id: order._id || order.id,
        order_number: order.orderNumber || order.order_number,
        customer_id: order.customerId || order.customer_id || null,
        status: order.status,
        total_amount: order.totalAmount || order.total_amount || 0,
        paid_amount: order.paidAmount || order.paid_amount || 0,
        created_at: order.createdAt || order.created_at,
        recordedBy: order.recordedBy || null,
        customer: order.customer ? {
          name: order.customer.name,
          phone: order.customer.phone || null,
        } : null,
      }))

      setOrders(transformedOrders)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load orders",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "in_process") {
        filtered = filtered.filter((order) => order.status === "in_process" || order.status === "partially_paid")
      } else {
        filtered = filtered.filter((order) => order.status === statusFilter)
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer?.phone?.includes(searchTerm)
      )
    }

    return filtered
  }, [searchTerm, statusFilter, orders])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-orange-100 text-orange-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "in_process":
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
      case "unpaid":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
      case "unpaid":
        return <XCircle className="h-4 w-4" />
      case "ready":
        return <Package className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const statusCounts = {
    all: orders.length,
    received: orders.filter((o) => o.status === "received").length,
    accepted: orders.filter((o) => o.status === "accepted").length,
    in_process: orders.filter((o) => o.status === "in_process" || o.status === "partially_paid").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage all customer orders</p>
        </div>
        <Link href="/admin/orders/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("all")}>
          <div className="text-sm text-gray-600">All Orders</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{statusCounts.all}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("received")}>
          <div className="text-sm text-gray-600">Received</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{statusCounts.received}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("in_process")}>
          <div className="text-sm text-gray-600">In Process</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{statusCounts.in_process}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("ready")}>
          <div className="text-sm text-gray-600">Ready</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{statusCounts.ready}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("delivered")}>
          <div className="text-sm text-gray-600">Delivered</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{statusCounts.delivered}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("cancelled")}>
          <div className="text-sm text-gray-600">Cancelled</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{statusCounts.cancelled}</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by order number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="received">Pending (Received)</option>
              <option value="accepted">Accepted</option>
              <option value="in_process">In Process</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No orders found</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {(() => {
                           const isLeaving = ["ready", "completed", "delivered"].includes(order.status);
                           const isPaid = (order.paid_amount || 0) >= (order.total_amount || 0);
                           const isRed = isLeaving && !isPaid;
                           const isGreen = isLeaving && isPaid;
                           const isYellow = order.status === "in_process" || order.status === "partially_paid";
                           const isBlue = order.status === "accepted" || order.status === "received";
                           
                           let tickColor = "text-gray-400";
                           if (isRed) tickColor = "text-red-600";
                           else if (isGreen) tickColor = "text-green-600";
                           else if (isYellow) tickColor = "text-yellow-500";
                           else if (isBlue) tickColor = "text-blue-500";

                           return <Check className={`h-4 w-4 ${tickColor} stroke-[4px]`} />;
                        })()}
                        <div className="text-sm font-black text-gray-900">
                          {order.order_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.customer_id ? (
                        <div 
                          className="text-sm cursor-pointer hover:text-blue-600 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/customers/${order.customer_id}`);
                          }}
                        >
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {order.customer?.name}
                          </div>
                          {order.customer?.phone && (
                            <div className="text-gray-500">{order.customer.phone}</div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-900">Walk-in Customer</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      RWF {order.total_amount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RWF {order.paid_amount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase tracking-wider text-[10px]">
                        {order.recordedBy || "Gasasira"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isSuperiorAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete({ id: order.id, order_number: order.order_number });
                            }}
                            disabled={deleting === order.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleting === order.id ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Order"
        description={`Are you sure you want to delete order #${confirmDelete?.order_number}? This action will permanently remove the order, its items, and associated payment records. This cannot be undone.`}
        confirmText="Delete Order"
        cancelText="Keep Order"
        variant="danger"
        loading={!!deleting}
      />
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { 
  Plus, 
  Search, 
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface DeliveryTask {
  id: string
  order_id: string
  assigned_to: string | null
  type: string
  address: string
  phone: string | null
  status: string
  scheduled_at: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
  order?: {
    order_number: string
    customer_id: string | null
  }
  assigned_user?: {
    full_name: string
    phone: string | null
  }
}



export default function DeliveryPage() {
  const [tasks, setTasks] = useState<DeliveryTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<DeliveryTask[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [availableOrders, setAvailableOrders] = useState<any[]>([])
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([])
  const [scheduleForm, setScheduleForm] = useState({
    order_id: "",
    type: "pickup",
    address: "",
    phone: "",
    scheduled_at: "",
    assigned_to: "",
    notes: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [searchTerm, typeFilter, statusFilter, tasks])

  const loadData = async () => {
    try {
      // Load delivery tasks
      const tasksRes = await fetch("/api/admin/delivery")
      if (!tasksRes.ok) throw new Error("Failed to load delivery tasks")
      const tasksData = await tasksRes.json()
      
      const transformedTasks = (tasksData.tasks || []).map((task: any) => ({
        id: task._id || task.id,
        order_id: task.orderId || task.order_id,
        assigned_to: task.assignedTo || task.assigned_to || null,
        type: task.type,
        address: task.address,
        phone: task.phone || null,
        status: task.status,
        scheduled_at: task.scheduledAt || task.scheduled_at || null,
        completed_at: task.completedAt || task.completed_at || null,
        notes: task.notes || null,
        created_at: task.createdAt || task.created_at,
        order: task.order ? {
          order_number: task.order.orderNumber || task.order.order_number,
          customer_id: task.order.customerId || task.order.customer_id || null,
        } : null,
        assigned_user: task.assigned_user ? {
          full_name: task.assigned_user.fullName || task.assigned_user.full_name,
          phone: task.assigned_user.phone || null,
        } : null,
      }))

      setTasks(transformedTasks)
      setFilteredTasks(transformedTasks)

      // Load available orders
      const ordersRes = await fetch("/api/admin/orders")
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        const available = (ordersData.orders || []).filter((o: any) => 
          ["received", "in_process", "ready"].includes(o.status)
        ).map((o: any) => ({
          id: o._id || o.id,
          order_number: o.orderNumber || o.order_number,
          status: o.status,
        }))
        setAvailableOrders(available)
      }

      // Load available drivers
      const driversRes = await fetch("/api/admin/users?role=delivery")
      if (driversRes.ok) {
        const driversData = await driversRes.json()
        const drivers = (driversData.users || []).filter((u: any) => u.isActive !== false).map((u: any) => ({
          id: u._id || u.id,
          full_name: u.fullName || u.full_name,
          phone: u.phone || null,
        }))
        setAvailableDrivers(drivers)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load delivery data",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = [...tasks]

    if (typeFilter !== "all") {
      filtered = filtered.filter((task) => task.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.phone?.includes(searchTerm)
      )
    }

    setFilteredTasks(filtered)
  }

  const handleSchedule = async () => {
    if (!scheduleForm.order_id || !scheduleForm.address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to schedule task")
      }

      toast({
        title: "Success",
        description: `${scheduleForm.type === "pickup" ? "Pickup" : "Delivery"} scheduled successfully`,
      })

      setShowScheduleModal(false)
      setScheduleForm({
        order_id: "",
        type: "pickup",
        address: "",
        phone: "",
        scheduled_at: "",
        assigned_to: "",
        notes: "",
      })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to schedule task",
      })
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/delivery/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update status")
      }

      toast({
        title: "Success",
        description: `Task status updated to ${newStatus}`,
      })

      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update status",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "pickup" ? "bg-purple-100 text-purple-800" : "bg-cyan-100 text-cyan-800"
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_transit: tasks.filter((t) => t.status === "in_transit").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pickups: tasks.filter((t) => t.type === "pickup").length,
    deliveries: tasks.filter((t) => t.type === "delivery").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery & Pickup</h1>
          <p className="text-gray-600 mt-1">Manage delivery and pickup tasks</p>
        </div>
        <Button
          onClick={() => setShowScheduleModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">In Transit</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.in_transit}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pickups</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.pickups}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Deliveries</div>
          <div className="text-2xl font-bold text-cyan-600 mt-1">{stats.deliveries}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by order number, address, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Tasks Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading tasks...</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No delivery tasks found</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.order ? (
                        <Link href={`/admin/orders/${task.order_id}`} className="block hover:text-blue-600">
                          <div className="text-sm font-medium text-gray-900">
                            {task.order.order_number || "N/A"}
                          </div>
                          {task.phone && (
                            <div className="text-sm text-gray-500">{task.phone}</div>
                          )}
                        </Link>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            N/A
                          </div>
                          {task.phone && (
                            <div className="text-sm text-gray-500">{task.phone}</div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                          task.type
                        )}`}
                      >
                        {task.type === "pickup" ? (
                          <Truck className="h-3 w-3" />
                        ) : (
                          <MapPin className="h-3 w-3" />
                        )}
                        {task.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.order ? (
                        <Link href={`/admin/orders/${task.order_id}`} className="block hover:text-blue-600">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={task.address}>
                            {task.address}
                          </div>
                          {task.phone && (
                            <div className="text-xs text-gray-500 mt-1">📞 {task.phone}</div>
                          )}
                        </Link>
                      ) : (
                        <>
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={task.address}>
                            {task.address}
                          </div>
                          {task.phone && (
                            <div className="text-xs text-gray-500 mt-1">📞 {task.phone}</div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.assigned_user?.full_name || "Unassigned"}
                      </div>
                      {task.assigned_user?.phone && (
                        <div className="text-xs text-gray-500">{task.assigned_user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.scheduled_at ? (
                        <div className="text-sm text-gray-900">
                          {new Date(task.scheduled_at).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status === "completed" && <CheckCircle className="h-3 w-3" />}
                        {task.status === "pending" && <Clock className="h-3 w-3" />}
                        {task.status === "cancelled" && <XCircle className="h-3 w-3" />}
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {task.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, "in_transit")}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === "in_transit" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, "completed")}
                          >
                            Complete
                          </Button>
                        )}
                        {task.order && (
                          <Link href={`/admin/orders/${task.order_id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
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

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Pickup/Delivery</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Order *</label>
                <select
                  value={scheduleForm.order_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, order_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select order</option>
                  {availableOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Type *</label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Address *</label>
                <Input
                  value={scheduleForm.address}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, address: e.target.value })
                  }
                  placeholder="Enter address"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                <Input
                  value={scheduleForm.phone}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Scheduled Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={scheduleForm.scheduled_at}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Assign Driver
                </label>
                <select
                  value={scheduleForm.assigned_to}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, assigned_to: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {availableDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.full_name} {driver.phone ? `(${driver.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSchedule} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Schedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowScheduleModal(false)
                    setScheduleForm({
                      order_id: "",
                      type: "pickup",
                      address: "",
                      phone: "",
                      scheduled_at: "",
                      assigned_to: "",
                      notes: "",
                    })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


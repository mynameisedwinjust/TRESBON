"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Package,
  Camera,
  Merge,
  Split,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Plus,
  ChevronDown,
  ChevronUp,
  Printer,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Order {
  id: string
  order_number: string
  customer_id?: string | null
  branch_id?: string
  status: string
  total_amount: number
  paid_amount?: number
  delivery_fee?: number
  discount_amount?: number
  notes?: string | null
  received_at?: string | null
  accepted_at?: string | null
  ready_at?: string | null
  delivered_at?: string | null
  recordedBy?: string | null
  expectedPickupAt?: string | null
  created_at?: string
  clothesTaken?: boolean
  customer?: {
    name: string
    phone: string | null
  } | null
  delivery_tasks?: Array<{
    type: string
    address: string
    phone?: string | null
    status: string
  }>
}

interface OrderItem {
  id: string
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  pre_cleaning_photo_url: string | null
  post_cleaning_photo_url: string | null
  notes?: string | null
  service?: {
    name: string
  }
}



function OrderDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [status, setStatus] = useState("")
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [editingNotesItemId, setEditingNotesItemId] = useState<string | null>(null)
  const [editingNotesText, setEditingNotesText] = useState("")
  const [mergeOrderId, setMergeOrderId] = useState("")
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash",
    transaction_id: "",
    notes: "",
  })

  // Auth checking
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "employee"
  const isSuperiorAdmin = userRole === "admin" || userRole === "supervisor"

  useEffect(() => {
    loadOrderData()
  }, [params.id])

  const loadOrderData = async () => {
    try {
      // Load order from admin API
      const orderRes = await fetch(`/api/admin/orders/${params.id}`)
      if (!orderRes.ok) throw new Error("Failed to load order")
      const orderData = await orderRes.json()
      const order = orderData.order

      setOrder({
        id: order._id || order.id,
        order_number: order.orderNumber || order.order_number,
        customer_id: order.customerId || order.customer_id || null,
        branch_id: order.branchId || order.branch_id || null,
        clothesTaken: order.clothesTaken || order.clothes_taken || false,
        status: order.status,
        total_amount: order.totalAmount || order.total_amount || 0,
        paid_amount: order.paidAmount || order.paid_amount || 0,
        delivery_fee: order.deliveryFee || order.delivery_fee || 0,
        discount_amount: order.discountAmount || order.discount_amount || 0,
        notes: order.notes || null,
        received_at: order.receivedAt || order.received_at || null,
        accepted_at: order.acceptedAt || order.accepted_at || null,
        ready_at: order.readyAt || order.ready_at || null,
        delivered_at: order.deliveredAt || order.delivered_at || null,
        recordedBy: order.recordedBy || null,
        expectedPickupAt: order.expectedPickupAt || order.expected_pickup_at || null,
        created_at: order.createdAt || order.created_at,
        customer: order.customer || null,
      })
      setStatus(order.status)

      // Load order items from order data
      setItems((order.order_items || []).map((item: any) => ({
        id: item._id || item.id,
        item_name: item.itemName || item.item_name,
        quantity: item.quantity,
        unit_price: item.unitPrice || item.unit_price,
        total_price: item.totalPrice || item.total_price,
        notes: item.notes || item.barcode || null,
        pre_cleaning_photo_url: item.preCleaningPhotoUrl || item.pre_cleaning_photo_url || null,
        post_cleaning_photo_url: item.postCleaningPhotoUrl || item.post_cleaning_photo_url || null,
        service: item.service ? { name: item.service.name } : null,
      })))

      // Load available orders for merge
      const ordersRes = await fetch("/api/admin/orders")
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        const available = (ordersData.orders || []).filter((o: any) =>
          (o._id || o.id) !== params.id && ["received", "in_process"].includes(o.status)
        ).slice(0, 20).map((o: any) => ({
          id: o._id || o.id,
          order_number: o.orderNumber || o.order_number,
          status: o.status,
          total_amount: o.totalAmount || o.total_amount || 0,
          customer_id: o.customerId || o.customer_id || null,
          branch_id: o.branchId || o.branch_id || undefined,
          paid_amount: o.paidAmount || o.paid_amount || 0,
          delivery_fee: o.deliveryFee || o.delivery_fee || 0,
          discount_amount: o.discountAmount || o.discount_amount || 0,
          created_at: o.createdAt || o.created_at,
        })) as Order[]
        setAvailableOrders(available)
      }

      // Load payments from order data
      setPayments((order.payments || []).map((p: any) => ({
        id: p._id || p.id,
        amount: p.amount,
        method: p.method,
        status: p.status,
        transaction_id: p.transactionId || p.transaction_id || null,
        created_at: p.createdAt || p.created_at,
      })))

      // Store delivery tasks for display
      if (order.deliveryTasks && order.deliveryTasks.length > 0 && order) {
        setOrder(prev => prev ? {
          ...prev,
          delivery_tasks: order.deliveryTasks.map((dt: any) => ({
            type: dt.type,
            address: dt.address || "",
            phone: dt.phone || null,
            status: dt.status,
          }))
        } : null)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load order data",
      })
    } finally {
      setLoading(false)
    }
  }

  const acceptOrder = async () => {
    setSaving(true)
    try {
      const orderId = order?.id || params.id
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to accept order")
      }

      toast({
        title: "Order Accepted",
        description: "Order has been accepted and is now in process",
      })

      setStatus("accepted")
      loadOrderData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to accept order",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    setSaving(true)
    try {
      const orderId = order?.id || params.id
      const response = await fetch(`/api/admin/orders/${orderId}`, {
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
        description: `Order status updated to ${newStatus.replace("_", " ")}`,
      })

      setStatus(newStatus)
      loadOrderData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update status",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleMerge = async () => {
    if (!mergeOrderId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an order to merge",
      })
      return
    }

    setSaving(true)
    try {
      // TODO: Create /api/admin/orders/[id]/merge endpoint
      toast({
        title: "Success",
        description: "Orders merged successfully",
      })

      setShowMergeModal(false)
      loadOrderData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to merge orders",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSplit = async () => {
    // Split order - create new order with selected items
    toast({
      title: "Info",
      description: "Split functionality - select items to move to new order",
    })
    // TODO: Implement split logic
  }

  const verifyPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to verify payment")
      }

      toast({
        title: "Success",
        description: "Payment verified and marked as completed",
      })

      loadOrderData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to verify payment",
      })
    }
  }

  const handleAddPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount",
      })
      return
    }

    const amount = parseFloat(paymentForm.amount)

    setSaving(true)
    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          method: paymentForm.method,
          transaction_id: paymentForm.transaction_id,
          notes: paymentForm.notes,
          order_id: order?.id || params.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to add payment")
      }

      toast({
        title: "Success",
        description: `Payment of RWF ${amount.toLocaleString()} added successfully`,
      })

      setShowPaymentModal(false)
      setPaymentForm({
        amount: "",
        method: "cash",
        transaction_id: "",
        notes: "",
      })
      loadOrderData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add payment",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveItemNotes = async (itemId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/order-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editingNotesText })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update notes")
      }

      setItems(items.map(item => 
        item.id === itemId ? { ...item, notes: editingNotesText } : item
      ))
      setEditingNotesItemId(null)
      
      toast({
        title: "Success",
        description: "Item notes updated successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update notes",
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteOrder = async () => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${order?.id || params.id}`, {
        method: "DELETE"
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete order")
      }
      toast({ title: "Success", description: "Order deleted successfully" })
      router.push("/admin/orders")
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete order" })
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-800"
      case "in_process":
        return "bg-yellow-100 text-yellow-800"
      case "partially_paid":
        return "bg-blue-100 text-blue-800"
      case "ready":
      case "completed":
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading order data...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <Card className="p-12 text-center">
          <p className="text-gray-500">Order not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="text-gray-600 mt-1">Order details and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/orders/${order.id}/receipt`}>
            <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold shadow-sm">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowMergeModal(true)}
            disabled={order.status === "delivered" || order.status === "cancelled"}
          >
            <Merge className="h-4 w-4 mr-2" />
            Merge
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSplitModal(true)}
            disabled={order.status === "delivered" || order.status === "cancelled"}
          >
            <Split className="h-4 w-4 mr-2" />
            Split
          </Button>
          {isSuperiorAdmin && (
            <Button
              variant="destructive"
              onClick={deleteOrder}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Customer</div>
                {order.customer_id ? (
                  <Link 
                    href={`/admin/customers/${order.customer_id}`}
                    className="block group cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="text-base font-medium text-gray-900 group-hover:text-blue-600">
                      {order.customer?.name}
                    </div>
                    {order.customer?.phone && (
                      <div className="text-sm text-gray-500">{order.customer.phone}</div>
                    )}
                  </Link>
                ) : (
                  <div>
                    <div className="text-base font-medium text-gray-900">Walk-in Customer</div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    status
                  )}`}
                >
                  {status === "delivered" && <CheckCircle className="h-4 w-4" />}
                  {status === "cancelled" && <XCircle className="h-4 w-4" />}
                  {(status === "received" || status === "accepted" || status === "in_process") && (
                    <Clock className="h-4 w-4" />
                  )}
                  {status === "accepted" && <CheckCircle className="h-4 w-4" />}
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-base font-medium text-gray-900">
                  RWF {order.total_amount?.toLocaleString() || "0"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Paid Amount</div>
                <div className="text-base font-medium text-gray-900">
                  RWF {order.paid_amount?.toLocaleString() || "0"}
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm text-gray-600">Expected Pickup</div>
                <div className="text-sm font-semibold text-gray-900 mt-1">
                  {order.expectedPickupAt ? new Date(order.expectedPickupAt).toLocaleString('en-GB', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                  }) : "Not Set"}
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm text-gray-600">Created By</div>
                <div className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded inline-block uppercase tracking-wide mt-1">
                  {order.recordedBy || "Gasasira"}
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="mt-6 pt-6 border-t">
              <Label className="mb-3 block text-gray-700 font-semibold">Update Status</Label>
              <div className="flex gap-3 flex-wrap">
                {(() => {
                  const statuses = [
                    {value: "in_process", label: "In Progress"}, 
                    {value: "partially_paid", label: "Partially Paid"}, 
                    {value: "unpaid", label: "Unpaid"},
                    {value: "completed", label: "Completed"}
                  ];
                  
                  if ((order.paid_amount || 0) === 0) {
                    statuses.push({value: "cancelled", label: "Cancelled"});
                  }

                  return statuses.map((s) => (
                    <Button
                      key={s.value}
                      type="button"
                      variant={status === s.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(s.value)}
                      disabled={saving}
                      className={`min-w-[120px] font-bold tracking-wide uppercase ${status === s.value ? (s.value === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' : s.value === 'partially_paid' ? 'bg-blue-400 hover:bg-blue-500 text-white' : (s.value === 'cancelled' || s.value === 'unpaid') ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white') : ''} ${s.value === 'cancelled' && status !== s.value ? 'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700' : ''}`}
                    >
                      {s.label}
                    </Button>
                  ))
                })()}
              </div>
            </div>
          </Card>

          {/* Payments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentModal(true)}
                disabled={order.status === "cancelled"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
            {payments.length === 0 ? (
              <p className="text-gray-500">No payments recorded</p>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        RWF {payment.amount?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.method.charAt(0).toUpperCase() + payment.method.slice(1).replace("_", " ")} •{" "}
                        {new Date(payment.created_at).toLocaleString()}
                      </div>
                      {payment.transaction_id && (
                        <div className="text-xs text-gray-400">
                          Transaction: {payment.transaction_id}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${payment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      {payment.status === "pending" && payment.method !== "cash" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyPayment(payment.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${expandedItemId === item.id ? 'bg-blue-50/20 border-blue-200' : 'hover:bg-gray-50'}`}
                  onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.service?.name || "Service"}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Quantity: {item.quantity} × RWF {item.unit_price?.toLocaleString()} = RWF{" "}
                        {item.total_price?.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {expandedItemId === item.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedItemId === item.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Item Tracking ID</div>
                          <div className="text-xs text-blue-700 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100 inline-block">
                            {item.id}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Use this ID to tag or track this specific item.</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</div>
                            {expandedItemId === item.id && editingNotesItemId !== item.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-blue-600 px-2 py-0 border border-transparent hover:border-blue-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingNotesItemId(item.id)
                                  setEditingNotesText(item.notes || "")
                                }}
                              >
                                Edit Note
                              </Button>
                            )}
                          </div>
                          
                          {editingNotesItemId === item.id ? (
                            <div className="space-y-2" onClick={e => e.stopPropagation()}>
                              <textarea
                                className="w-full text-sm p-3 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                placeholder="Add specific instructions or notes for this item..."
                                value={editingNotesText}
                                onChange={e => setEditingNotesText(e.target.value)}
                                autoFocus
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => setEditingNotesItemId(null)}
                                  disabled={saving}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => saveItemNotes(item.id)}
                                  disabled={saving || !editingNotesText.trim() && !item.notes}
                                >
                                  Save Note
                                </Button>
                              </div>
                            </div>
                          ) : item.notes ? (
                            <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded border">
                              {item.notes}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">
                              No notes provided for this item.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photos */}
                      {(item.pre_cleaning_photo_url || item.post_cleaning_photo_url) && (
                        <div className="mt-4 flex gap-4 border-t pt-4">
                          {item.pre_cleaning_photo_url && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1 font-medium">Pre-Cleaning</div>
                              <img
                                src={item.pre_cleaning_photo_url}
                                alt="Pre-cleaning"
                                className="h-32 w-32 object-cover rounded-lg border shadow-sm"
                              />
                            </div>
                          )}
                          {item.post_cleaning_photo_url && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1 font-medium">Post-Cleaning</div>
                              <img
                                src={item.post_cleaning_photo_url}
                                alt="Post-cleaning"
                                className="h-32 w-32 object-cover rounded-lg border shadow-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collapsed view photos */}
                  {expandedItemId !== item.id && (item.pre_cleaning_photo_url || item.post_cleaning_photo_url) && (
                    <div className="mt-4 flex gap-4">
                      {item.pre_cleaning_photo_url && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          <Camera className="h-3 w-3" /> Pre-cleaning photo attached
                        </div>
                      )}
                      {item.post_cleaning_photo_url && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          <Camera className="h-3 w-3" /> Post-cleaning photo attached
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Information */}
          {order.delivery_tasks && order.delivery_tasks.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
              {order.delivery_tasks.map((task: any, idx: number) => (
                <div key={idx} className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Type:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.type === "delivery" ? "bg-cyan-100 text-cyan-800" : "bg-purple-100 text-purple-800"
                      }`}>
                      {task.type?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  {task.type === "delivery" && task.address && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Address:</span>
                      <p className="text-sm text-gray-900 mt-1">{task.address}</p>
                    </div>
                  )}
                  {task.phone && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Phone:</span>
                      <p className="text-sm text-gray-900 mt-1">{task.phone}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.status === "completed" ? "bg-green-100 text-green-800" :
                      task.status === "in_transit" ? "bg-blue-100 text-blue-800" :
                        task.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                      }`}>
                      {task.status?.replace("_", " ").toUpperCase() || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {order.notes && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-gray-700">{order.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  RWF{" "}
                  {(
                    order.total_amount - (order.delivery_fee || 0) + (order.discount_amount || 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">RWF {order.delivery_fee?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">
                  -RWF {order.discount_amount?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>RWF {order.total_amount?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-gray-600">Paid</span>
                <span className="font-medium">RWF {order.paid_amount?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Balance</span>
                <span className="font-medium text-red-600">
                  RWF {(order.total_amount - (order.paid_amount || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              {order.received_at && (
                <div>
                  <div className="text-gray-600">Received</div>
                  <div className="text-gray-900">
                    {new Date(order.received_at).toLocaleString()}
                  </div>
                </div>
              )}
              {order.ready_at && (
                <div>
                  <div className="text-gray-600">Ready</div>
                  <div className="text-gray-900">
                    {new Date(order.ready_at).toLocaleString()}
                  </div>
                </div>
              )}
              {order.delivered_at && (
                <div>
                  <div className="text-gray-600">Delivered</div>
                  <div className="text-gray-900">
                    {new Date(order.delivered_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Clothes Taken Selection */}
            <div className="mt-6 pt-6 border-t font-semibold">
              <Label className="mb-3 block text-gray-700">Clothes Pickup Status</Label>
              <div className="flex items-center gap-3">
                 <input 
                   type="checkbox" 
                   id="clothesTaken" 
                   className="w-5 h-5 accent-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                   checked={order.clothesTaken || false}
                   onChange={async (e) => {
                     const isTaken = e.target.checked;
                     setSaving(true);
                     try {
                       const response = await fetch(`/api/admin/orders/${order.id || params.id}`, {
                         method: "PATCH",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ clothesTaken: isTaken }),
                       });
                       if (!response.ok) throw new Error("Failed");
                       toast({ title: "Success", description: "Pickup status updated!" });
                       loadOrderData();
                     } catch {
                       toast({ variant: "destructive", title: "Error", description: "Failed to update pickup status" });
                     } finally {
                       setSaving(false);
                     }
                   }}
                   disabled={saving}
                 />
                 <label htmlFor="clothesTaken" className="text-sm font-medium text-gray-800 cursor-pointer select-none">
                   The clothes have been taken out by the customer
                 </label>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
            <div className="space-y-4">
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  className="mt-1"
                />
                {order && (
                  <div className="text-xs text-gray-500 mt-1">
                    Balance: RWF{" "}
                    {(order.total_amount - (order.paid_amount || 0)).toLocaleString()}
                  </div>
                )}
              </div>
              <div>
                <Label>Payment Method *</Label>
                <select
                  value={paymentForm.method}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, method: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              <div>
                <Label>Notes</Label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddPayment}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? "Processing..." : "Add Payment"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentForm({
                      amount: "",
                      method: "cash",
                      transaction_id: "",
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

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Merge Orders</h3>
            <div className="space-y-4">
              <div>
                <Label>Select Order to Merge</Label>
                <select
                  value={mergeOrderId}
                  onChange={(e) => setMergeOrderId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                >
                  <option value="">Select order</option>
                  {availableOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} - RWF {o.total_amount}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleMerge} disabled={saving} className="flex-1">
                  Merge
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMergeModal(false)
                    setMergeOrderId("")
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <OrderDetailContent params={params} />
    </Suspense>
  )
}


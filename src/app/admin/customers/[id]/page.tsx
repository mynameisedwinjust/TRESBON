"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Edit, Save, X, Star, ShoppingBag, DollarSign } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  gender: string | null
  type: string
  loyalty_points: number
  discount_percentage: number
  created_at: string
}

function CustomerDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get("edit") === "true"
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "",
    type: "regular",
    loyalty_points: 0,
    discount_percentage: 0,
  })

  useEffect(() => {
    loadCustomerData()
  }, [params.id])

  const loadCustomerData = async () => {
    try {
      // Load customer
      const customerRes = await fetch(`/api/admin/customers/${params.id}`)
      if (!customerRes.ok) throw new Error("Failed to load customer")
      const customerData = await customerRes.json()
      const customer = customerData.customer

      setCustomer({
        id: customer._id || customer.id,
        name: customer.name,
        phone: customer.phone || null,
        address: customer.address || null,
        gender: customer.gender || null,
        type: customer.type || "regular",
        loyalty_points: customer.loyaltyPoints || customer.loyalty_points || 0,
        discount_percentage: customer.discountPercentage || customer.discount_percentage || 0,
        created_at: customer.createdAt || customer.created_at,
      })
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        gender: customer.gender || "",
        type: customer.type || "regular",
        loyalty_points: customer.loyaltyPoints || customer.loyalty_points || 0,
        discount_percentage: customer.discountPercentage || customer.discount_percentage || 0,
      })

      // Load orders
      const ordersRes = await fetch("/api/admin/orders")
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        const customerOrders = (ordersData.orders || []).filter((o: any) => 
          (o.customerId || o.customer_id) === params.id
        ).slice(0, 10)
        setOrders(customerOrders)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load customer data",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/customers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
          gender: formData.gender || null,
          type: formData.type,
          loyaltyPoints: formData.loyalty_points || 0,
          discountPercentage: formData.discount_percentage || 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update customer")
      }

      toast({
        title: "Success",
        description: "Customer updated successfully",
      })

      router.push(`/admin/customers/${params.id}`)
      loadCustomerData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update customer",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        gender: customer.gender || "",
        type: customer.type || "regular",
        loyalty_points: customer.loyalty_points || 0,
        discount_percentage: customer.discount_percentage || 0,
      })
    }
    router.push(`/admin/customers/${params.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customer data...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
        <Card className="p-12 text-center">
          <p className="text-gray-500">Customer not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Customer" : customer.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? "Update customer information" : "Customer details and history"}
            </p>
          </div>
        </div>
        {!isEditMode && (
          <Link href={`/admin/customers/${params.id}?edit=true`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditMode ? "Edit Information" : "Customer Information"}
            </h2>
            {isEditMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Customer Type</Label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="regular">Regular</option>
                      <option value="walk-in">Walk-in</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Percentage</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discount_percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="text-base font-medium text-gray-900">{customer.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="text-base text-gray-900">{customer.phone || "—"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Type</div>
                    <div className="text-base text-gray-900 capitalize">
                      {customer.type === "regular" ? "Regular" : "Walk-in"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Member Since</div>
                    <div className="text-base text-gray-900">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {customer.address && (
                  <div>
                    <div className="text-sm text-gray-600">Address</div>
                    <div className="text-base text-gray-900">{customer.address}</div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Order History */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id || order._id}
                    onClick={() => router.push(`/admin/orders/${order.id || order._id}`)}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-900">Order #{order.orderNumber || order.order_number || (order.id || order._id).slice(0, 8)}</div>
                      <div className="text-sm text-gray-500">
                        {order.createdAt || order.created_at ? new Date(order.createdAt || order.created_at).toLocaleDateString() : "Unknown Date"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        RWF {(order.totalAmount || order.total_amount || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{order.status.replace("_", " ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-semibold text-gray-900">Orders Made</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {customer.loyalty_points || 0}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {customer.discount_percentage || 0}% discount applied
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Total Orders</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Total Spent</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              RWF{" "}
              {orders
                .reduce((sum, order) => sum + (order.total_amount || 0), 0)
                .toLocaleString()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <CustomerDetailContent params={params} />
    </Suspense>
  )
}


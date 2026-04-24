"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Clock, Calendar, FileText, Package } from "lucide-react"
import Link from "next/link"
import { getServiceData } from "@/lib/services-data"

interface ServiceItem {
  id: string
  name: string
  price: number
}

interface Service {
  id: string
  name: string
  type: string
  base_price: number
  items: ServiceItem[]
}

interface OrderItem {
  id: string
  service_id: string
  service_name?: string
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
  barcode?: string
  qr_code?: string
  pre_cleaning_photo?: string
  post_cleaning_photo?: string
}



export default function NewOrderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [orderNumber, setOrderNumber] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [expectedPickupAt, setExpectedPickupAt] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    generateOrderNumber()
    loadData()
  }, [])

  const generateOrderNumber = async () => {
    try {
      const res = await fetch("/api/admin/orders/next-number")
      if (res.ok) {
        const data = await res.json()
        setOrderNumber(data.nextOrderNumber || "001")
      } else {
        setOrderNumber("001")
      }
    } catch {
      setOrderNumber("001")
    }
  }

  const loadData = async () => {
    try {
      const [servicesRes, customersRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/admin/customers")
      ])

      if (servicesRes.ok) {
        const servicesDataRes = await servicesRes.json()
        const rawServices = servicesDataRes.services || []
        
        setServices(rawServices.map((s: any) => {
          let items = s.items?.map((i: any) => ({
            id: i.id || i._id,
            name: i.name,
            price: i.price,
          })) || []

          if (items.length === 0) {
            const staticService = getServiceData(s.id || s._id, rawServices)
            if (staticService && staticService.items) {
              items = staticService.items.map((i, idx) => ({
                id: `static-${idx}`,
                name: i.name,
                price: i.price || 0,
              }))
            }
          }

          return {
            id: s._id || s.id,
            name: s.name,
            type: s.type,
            base_price: s.basePrice || s.base_price,
            items,
          }
        }))
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers((customersData.customers || []).map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          phone: c.phone || null,
        })))
      }


    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load data",
      })
    }
  }


  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      service_id: "",
      service_name: "",
      item_name: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      notes: "",
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "service_id") {
            const service = services.find((s) => s.id === value)
            if (service) {
              updated.item_name = ""
              updated.service_name = service.name
              updated.unit_price = service.base_price
              updated.total_price = updated.unit_price * updated.quantity
            }
          } else if (field === "service_name") {
            const service = services.find((s) => s.name.toLowerCase() === value.toLowerCase())
            if (service) {
              updated.service_id = service.id
              updated.unit_price = service.base_price
              updated.item_name = ""
            } else {
              updated.service_id = "" // Custom service
              updated.unit_price = 0
            }
            updated.total_price = updated.unit_price * updated.quantity
          } else if (field === "item_name") {
            const service = services.find((s) => s.name === updated.service_name || s.id === updated.service_id)
            if (service && service.items && service.items.length > 0) {
              const selectedItem = service.items.find((i: any) => i.name.toLowerCase() === value.toLowerCase())
              if (selectedItem) {
                updated.unit_price = selectedItem.price
              }
            }
            updated.total_price = (Number(updated.unit_price) || 0) * (Number(updated.quantity) || 0)
          } else if (field === "quantity" || field === "unit_price") {
            updated.total_price = (Number(updated.unit_price) || 0) * (Number(updated.quantity) || 0)
          }
          return updated
        }
        return item
      })
    )
  }

  const handleBarcodeScan = (itemId: string, barcode: string) => {
    // Simulate barcode lookup - in real app, this would query database
    updateItem(itemId, "barcode", barcode)
    toast({
      title: "Barcode Scanned",
      description: `Barcode: ${barcode}`,
    })
  }

  const handleQRScan = (itemId: string, qrCode: string) => {
    updateItem(itemId, "qr_code", qrCode)
    toast({
      title: "QR Code Scanned",
      description: `QR Code: ${qrCode}`,
    })
  }

  const handlePhotoUpload = async (itemId: string, type: "pre" | "post", file: File) => {
    try {
      // In a real app, upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${itemId}-${type}-${Date.now()}.${fileExt}`

      // For now, create a data URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string
        if (type === "pre") {
          updateItem(itemId, "pre_cleaning_photo", photoUrl)
        } else {
          updateItem(itemId, "post_cleaning_photo", photoUrl)
        }
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload photo",
      })
    }
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0)
    return subtotal + (Number(deliveryFee) || 0) - (Number(discountAmount) || 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one item",
      })
      return
    }

    setLoading(true)

    try {
      const totalAmount = calculateTotal()

      // Create order via Admin API
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          branch_id: null,
          status: "received",
          total_amount: totalAmount,
          paid_amount: 0,
          delivery_fee: Number(deliveryFee) || 0,
          discount_amount: Number(discountAmount) || 0,
          expected_pickup_at: expectedPickupAt || null,
          notes: notes || null,
          items: items.map((item) => ({
            service_id: item.service_id,
            service_name: item.service_name,
            item_name: item.item_name,
            quantity: Number(item.quantity) || 0,
            unit_price: Number(item.unit_price) || 0,
            total_price: Number(item.total_price) || 0,
            notes: item.notes || null,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create order")
      }

      const orderData = await response.json()
      const order = orderData.order

      toast({
        title: "Success",
        description: `Order #${order.orderNumber || order.order_number} created successfully`,
      })

      router.push(`/admin/orders/${order._id || order.id}`)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create order",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-1">Add a new order with items</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card className="p-6 bg-blue-50 border-blue-200 shadow-sm">
              <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                Order #{orderNumber || "..."}
              </h2>
            </Card>

            {/* Customer Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input 
                    list="customers-name-list"
                    placeholder="Enter full name" 
                    value={customerName} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomerName(val);
                      const existing = customers.find(c => c.name.toLowerCase() === val.toLowerCase());
                      if (existing && existing.phone && !customerPhone) {
                        setCustomerPhone(existing.phone);
                      }
                    }} 
                  />
                  <datalist id="customers-name-list">
                    {customers.filter(c => c.name).map((c) => (
                      <option key={c.id} value={c.name}>{c.phone || ""}</option>
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    type="tel" 
                    list="customers-phone-list"
                    placeholder="e.g. 078XXXXXXX" 
                    value={customerPhone} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomerPhone(val);
                      const existing = customers.find(c => c.phone === val);
                      if (existing && existing.name && !customerName) {
                        setCustomerName(existing.name);
                      }
                    }} 
                  />
                  <datalist id="customers-phone-list">
                    {customers.filter(c => c.phone).map((c) => (
                      <option key={c.id} value={c.phone}>{c.name}</option>
                    ))}
                  </datalist>
                </div>
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Service *</Label>
                        <Input
                          list={`services-list-${item.id}`}
                          value={item.service_name || ""}
                          onChange={(e) => updateItem(item.id, "service_name", e.target.value)}
                          placeholder="Select or type service"
                          required
                        />
                        <datalist id={`services-list-${item.id}`}>
                          {services.map((service) => (
                            <option key={service.id} value={service.name} />
                          ))}
                        </datalist>
                      </div>
                      <div className="space-y-2">
                        <Label>Item Name</Label>
                        {(() => {
                          const service = services.find(s => s.name === item.service_name || s.id === item.service_id)
                          return (
                            <>
                              <Input
                                list={`items-list-${item.id}`}
                                value={item.item_name}
                                onChange={(e) => updateItem(item.id, "item_name", e.target.value)}
                                placeholder="Select or type item name"
                              />
                              <datalist id={`items-list-${item.id}`}>
                                {service && service.items && service.items.length > 0 ? (
                                  service.items.map((srvItem) => (
                                    <option key={srvItem.id} value={srvItem.name} />
                                  ))
                                ) : (
                                  <option value={service ? "Type custom item name" : "Please select a service first"} />
                                )}
                              </datalist>
                            </>
                          )
                        })()}
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity === 0 || item.quantity === "" as any ? "" : item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, "quantity", e.target.value === "" ? "" : parseInt(e.target.value))
                          }
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Price (RWF)</Label>
                        <Input
                          type="number"
                          value={item.unit_price === 0 || item.unit_price === "" as any ? "" : item.unit_price}
                          onChange={(e) =>
                            updateItem(item.id, "unit_price", e.target.value === "" ? "" : parseFloat(e.target.value))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Item Notes</Label>
                      <Input
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                        placeholder="e.g. Extra starch, handle with care..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Total: RWF {item.total_price.toLocaleString()}</Label>
                    </div>


                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No items added. Click "Add Item" to start.
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 border border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute -top-4 right-0 p-6 opacity-[0.03] pointer-events-none">
                 <Package className="h-48 w-48" />
              </div>
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4 relative z-10">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Additional Details</h2>
                  <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-0.5">Time & Notes</p>
                </div>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="bg-blue-50/70 p-6 rounded-2xl border border-blue-100/60 shadow-inner">
                  <Label className="flex items-center gap-2 text-blue-900 font-bold mb-2 text-sm uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Expected Pickup Date & Time
                    <span className="text-[10px] text-blue-500 font-black ml-2 uppercase tracking-widest bg-blue-100/80 px-2 py-0.5 rounded-sm border border-blue-200">Optional</span>
                  </Label>
                  <p className="text-xs text-blue-600/80 mb-4 font-medium italic">Record when the client intends to retrieve their items.</p>
                  <Input 
                    type="datetime-local" 
                    value={expectedPickupAt}
                    onChange={(e) => setExpectedPickupAt(e.target.value)}
                    className="w-full md:w-2/3 bg-white border-blue-200 focus-visible:ring-blue-500 shadow-sm transition-all"
                  />
                </div>

                <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 shadow-inner">
                  <Label className="flex items-center gap-2 text-gray-800 font-bold mb-3 text-sm uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Order Notes
                  </Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full min-h-[140px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y shadow-sm transition-all text-gray-700"
                    placeholder="Add special requests, handling instructions, or any extra details the team should know..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    RWF {items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>Delivery Fee</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryFee === 0 || deliveryFee === "" as any ? "" : deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value === "" ? "" as any : parseFloat(e.target.value))}
                    className="w-24 h-8"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between">
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountAmount === 0 || discountAmount === "" as any ? "" : discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value === "" ? "" as any : parseFloat(e.target.value))}
                    className="w-24 h-8"
                    placeholder="0"
                  />
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>RWF {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Creating..." : "Create Order"}
                </Button>
                <Link href="/admin/orders">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}


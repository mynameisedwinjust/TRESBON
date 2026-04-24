"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  Settings,
  Save,
  DollarSign,
  Bell,
  Server,
  Package,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag
} from "lucide-react"

interface ServiceItem {
  id: string
  name: string
  price: number
  isActive: boolean
}

interface Service {
  id: string
  name: string
  type: string
  base_price: number
  description: string | null
  is_active: boolean
  items: ServiceItem[]
}



export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"services" | "notifications" | "system">("services")
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    name: "",
    type: "washing",
    base_price: "",
    description: "",
  })
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [selectedServiceForItems, setSelectedServiceForItems] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
  })
  const [expandedServices, setExpandedServices] = useState<string[]>([])
  const [notificationTemplates, setNotificationTemplates] = useState({
    order_received: "Your order #{order_number} has been received. We'll notify you when it's ready!",
    order_ready: "Your order #{order_number} is ready for pickup/delivery!",
    order_delivered: "Your order #{order_number} has been delivered. Thank you!",
    payment_received: "Payment of RWF {amount} received for order #{order_number}.",
  })
  const [systemConfig, setSystemConfig] = useState({
    company_name: "TrèsBon DRY CLEANERS",
    company_email: "tresbondrycleaners01@gmail.com",
    company_phone: "0790 002 060 / 0726 230 475",
    currency: "RWF",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadServices()
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.systemConfig) {
          setSystemConfig({
            company_name: data.systemConfig.company_name || "TrèsBon DRY CLEANERS",
            company_email: data.systemConfig.company_email || "tresbondrycleaners01@gmail.com",
            company_phone: data.systemConfig.company_phone || "0790 002 060 / 0726 230 475",
            currency: data.systemConfig.currency || "RWF",
          })
        }
        if (data.notificationTemplates) {
          setNotificationTemplates({
            order_received: data.notificationTemplates.order_received || notificationTemplates.order_received,
            order_ready: data.notificationTemplates.order_ready || notificationTemplates.order_ready,
            order_delivered: data.notificationTemplates.order_delivered || notificationTemplates.order_delivered,
            payment_received: data.notificationTemplates.payment_received || notificationTemplates.payment_received,
          })
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const loadServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to load services";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.details || errorJson.error || errorMessage;
        } catch {
          errorMessage = `${response.status} ${errorText.substring(0, 50)}`;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json()
      console.log("LOADED SERVICES DATA:", data);

      const rawServices = Array.isArray(data.services) ? data.services : [];

      const dbServices = rawServices.map((s: any) => ({
        id: s.id || s._id,
        name: s.name || "Unnamed Service",
        type: s.type || "washing",
        base_price: Number(s.basePrice || s.base_price || 0),
        description: s.description || null,
        is_active: s.isActive !== false,
        items: Array.isArray(s.items) ? s.items.map((item: any) => ({
          id: item.id || item._id,
          name: item.name || "Unnamed Item",
          price: Number(item.price || 0),
          isActive: item.isActive !== false
        })) : [],
      }))
      setServices(dbServices)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load services",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateService = async (serviceId: string, updates: Partial<Service>) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update service")
      }

      toast({
        title: "Success",
        description: "Service updated successfully",
      })
      loadServices()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update service",
      })
    }
  }

  const handleUpdateServiceItem = async (itemId: string, updates: Partial<ServiceItem>) => {
    try {
      const response = await fetch(`/api/admin/service-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update item")
      }

      toast({
        title: "Success",
        description: "Item updated successfully",
      })
      loadServices()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update item",
      })
    }
  }

  const handleDeleteServiceItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      const response = await fetch(`/api/admin/service-items/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete item")

      toast({ title: "Success", description: "Item deleted" })
      loadServices()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete item",
      })
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to permanently delete this service and all its items?")) return
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete service")
      }

      toast({ title: "Success", description: "Service deleted successfully" })
      loadServices()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete service",
      })
    }
  }

  const handleAddItem = async () => {
    if (!selectedServiceForItems || !itemForm.name || !itemForm.price) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/services/${selectedServiceForItems}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemForm.name,
          price: parseFloat(itemForm.price) || 0,
        }),
      })

      if (!response.ok) throw new Error("Failed to add item")

      toast({ title: "Success", description: "Item added" })
      setShowAddItemModal(false)
      setItemForm({ name: "", price: "" })
      loadServices()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleAddService = async () => {
    if (!serviceForm.name || !serviceForm.base_price) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name and price are required",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceForm.name,
          type: serviceForm.type,
          base_price: parseFloat(serviceForm.base_price) || 0,
          description: serviceForm.description || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to add service")
      }

      toast({
        title: "Success",
        description: "Service added successfully",
      })

      setShowAddServiceModal(false)
      setServiceForm({
        name: "",
        type: "washing",
        base_price: "",
        description: "",
      })
      loadServices()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add service",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationTemplates }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save notification templates")
      }

      toast({
        title: "Success",
        description: "Notification templates saved successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save notification templates",
      })
    }
  }

  const handleSaveSystemConfig = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemConfig: {
            company_name: systemConfig.company_name,
            company_email: systemConfig.company_email,
            company_phone: systemConfig.company_phone,
            currency: systemConfig.currency,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save system configuration")
      }

      toast({
        title: "Success",
        description: "System configuration saved successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save system configuration",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure system settings, prices and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === "services"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <Package className="h-4 w-4" />
          Services & Prices
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === "notifications"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === "system"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <Server className="h-4 w-4" />
          System Config
        </button>
      </div>

      {/* Services & Prices Tab */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Services & Pricing</h2>
              <Button onClick={() => setShowAddServiceModal(true)} className="bg-blue-600 hover:bg-blue-700">
                Add Service
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No services found</div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 bg-white">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleServiceExpansion(service.id)}
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {expandedServices.includes(service.id) ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) =>
                              handleUpdateService(service.id, { name: e.target.value })
                            }
                            className="w-full font-bold text-gray-900 bg-transparent border-none focus:ring-1 focus:ring-blue-100 p-1 -ml-1 rounded text-base"
                          />
                          <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-0.5 ml-1">
                            {service.type.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <Label className="text-[10px] font-black uppercase text-gray-400">Base Price</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-gray-400">RWF</span>
                            <Input
                              type="number"
                              value={service.base_price}
                              onChange={(e) =>
                                handleUpdateService(service.id, {
                                  base_price: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-28 h-9 font-bold"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 h-full pt-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={service.is_active}
                              onChange={(e) =>
                                handleUpdateService(service.id, { is_active: e.target.checked })
                              }
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-gray-600">Active</span>
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedServiceForItems(service.id)
                              setShowAddItemModal(true)
                            }}
                            className="h-9 border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Item
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteService(service.id)}
                            className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 -ml-2"
                            title="Delete Service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {expandedServices.includes(service.id) && (
                      <div className="bg-gray-50/50 border-t p-4 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">
                          <Tag className="h-3 w-3" />
                          Individual Items & Specific Pricing
                        </div>
                        {service.items.length === 0 ? (
                          <div className="text-center py-6 text-gray-400 text-sm bg-white border border-dashed rounded-xl mx-2">
                            No specific items configured. Using base price.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-2 pb-2">
                            {service.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm group">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleUpdateServiceItem(item.id, { name: e.target.value })}
                                    className="w-full text-sm font-bold text-gray-700 bg-transparent border-none focus:ring-1 focus:ring-blue-100 p-1 -ml-1 rounded"
                                  />
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400">RWF</span>
                                    <input
                                      type="number"
                                      value={item.price}
                                      onChange={(e) => handleUpdateServiceItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                                      className="w-24 h-8 text-sm font-black border-none focus:ring-0 p-0 text-right"
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteServiceItem(item.id)}
                                    className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Templates</h2>
          <div className="space-y-6">
            <div>
              <Label>Order Received Template</Label>
              <textarea
                value={notificationTemplates.order_received}
                onChange={(e) =>
                  setNotificationTemplates({
                    ...notificationTemplates,
                    order_received: e.target.value,
                  })
                }
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                placeholder="Order received notification template"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {"{"}order_number{"}"}
              </p>
            </div>
            <div>
              <Label>Order Ready Template</Label>
              <textarea
                value={notificationTemplates.order_ready}
                onChange={(e) =>
                  setNotificationTemplates({
                    ...notificationTemplates,
                    order_ready: e.target.value,
                  })
                }
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                placeholder="Order ready notification template"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {"{"}order_number{"}"}
              </p>
            </div>
            <div>
              <Label>Order Delivered Template</Label>
              <textarea
                value={notificationTemplates.order_delivered}
                onChange={(e) =>
                  setNotificationTemplates({
                    ...notificationTemplates,
                    order_delivered: e.target.value,
                  })
                }
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                placeholder="Order delivered notification template"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {"{"}order_number{"}"}
              </p>
            </div>
            <div>
              <Label>Payment Received Template</Label>
              <textarea
                value={notificationTemplates.payment_received}
                onChange={(e) =>
                  setNotificationTemplates({
                    ...notificationTemplates,
                    payment_received: e.target.value,
                  })
                }
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                placeholder="Payment received notification template"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {"{"}order_number{"}"}, {"{"}amount{"}"}
              </p>
            </div>
            <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Notification Templates
            </Button>
          </div>
        </Card>
      )}

      {/* System Config Tab */}
      {activeTab === "system" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={systemConfig.company_name}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, company_name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Company Email</Label>
                <Input
                  type="email"
                  value={systemConfig.company_email}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, company_email: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Company Phone</Label>
                <Input
                  value={systemConfig.company_phone}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, company_phone: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  value={systemConfig.currency}
                  onChange={(e) =>
                    setSystemConfig({ ...systemConfig, currency: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleSaveSystemConfig} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save System Configuration
            </Button>
          </div>
        </Card>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
            <div className="space-y-4">
              <div>
                <Label>Service Name *</Label>
                <Input
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Enter service name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Service Type *</Label>
                <select
                  value={serviceForm.type}
                  onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  required
                >
                  <option value="washing">Washing</option>
                  <option value="ironing">Ironing</option>
                  <option value="dry_cleaning">Dry Cleaning</option>
                  <option value="laundry">Laundry</option>
                  <option value="stain_removal">Stain Removal</option>
                  <option value="folding">Folding</option>
                </select>
              </div>
              <div>
                <Label>Base Price (RWF) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={serviceForm.base_price}
                  onChange={(e) => setServiceForm({ ...serviceForm, base_price: e.target.value })}
                  placeholder="0.00"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, description: e.target.value })
                  }
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  placeholder="Service description"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddService}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? "Adding..." : "Add Service"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddServiceModal(false)
                    setServiceForm({
                      name: "",
                      type: "washing",
                      base_price: "",
                      description: "",
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
      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-sm shadow-2xl border-0 rounded-3xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-xl font-black text-gray-900">Add Item</h3>
                <p className="text-gray-400 text-xs font-medium">Add a specific item to this service</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100" onClick={() => setShowAddItemModal(false)}>
                <Plus className="h-6 w-6 rotate-45 text-gray-400" />
              </Button>
            </div>
            <div className="p-6 space-y-4 bg-gray-50/50">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Item Name</Label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Enter item name"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price (RWF)</Label>
                <Input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="0"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setShowAddItemModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddItem}
                  disabled={saving || !itemForm.name || !itemForm.price}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {saving ? "Adding..." : "Add Item"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


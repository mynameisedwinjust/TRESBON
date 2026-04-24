"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Search,
  Edit,
  Eye,
  Star,
  Mail,
  Phone,
  MapPin
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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



export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm)
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchTerm, customers])

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers")
      if (!response.ok) throw new Error("Failed to load customers")

      const data = await response.json()
      const customersData = (data.customers || []).map((c: any) => ({
        id: c._id || c.id,
        name: c.name || "Unknown Customer",
        phone: c.phone || null,
        address: c.address || null,
        gender: c.gender || null,
        type: c.type || "regular",
        loyalty_points: c.loyaltyPoints || c.loyalty_points || 0,
        discount_percentage: c.discountPercentage || c.discount_percentage || 0,
        created_at: c.createdAt || c.created_at,
      }))

      setCustomers(customersData)
      setFilteredCustomers(customersData)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load customers.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage all customer accounts</p>
        </div>
        <Link href="/admin/customers/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Customers Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No customers found</p>
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={() => setSearchTerm("")}
              className="mt-4"
            >
              Clear search
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders Made
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>

                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${customer.type === "regular"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {customer.type === "regular" ? "Regular" : "Walk-in"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {customer.loyalty_points || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.discount_percentage || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/customers/${customer.id}?edit=true`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Customers</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {customers.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Regular Customers</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {customers.filter((c) => c.type === "regular").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Orders Made</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0)}
          </div>
        </Card>
      </div>
    </div>
  )
}


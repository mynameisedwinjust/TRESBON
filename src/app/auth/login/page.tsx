"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Sparkles, Package, Truck, Star } from "lucide-react"
import { Eye, EyeOff, Mail, AlertCircle, X, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"


export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Admin Login specific states
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPhone, setAdminPhone] = useState("0785007239")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminShowPassword, setAdminShowPassword] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent, isMainLogin = true) => {
    e.preventDefault()
    setLoading(true)

    const loginPhone = isMainLogin ? phone : adminPhone
    const loginPassword = isMainLogin ? password : adminPassword

    try {
      const result = await signIn('credentials', {
        phone: loginPhone.trim(),
        password: loginPassword,
        redirect: false,
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid phone number or password. Please try again.",
        })
        setLoading(false)
        return
      }

      if (result?.ok) {
        // Get the session to check user role
        const response = await fetch('/api/auth/session')
        const session = await response.json()

        if (session?.user) {
          const userRole = session.user.role

          // If logging in via Admin Modal, verify it's actually an admin
          if (!isMainLogin && userRole !== "admin") {
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "This account does not have admin privileges.",
            })
            if (['cashier', 'cleaner', 'delivery', 'supervisor'].includes(userRole || '')) {
              router.push(`/staff/${userRole}`)
            } else {
              // Deny customers
              toast({ variant: "destructive", title: "Access Denied", description: "Internal system only." })
            }
            router.refresh()
            return
          }

          // Force deny customers from logging in since this is an internal system
          if (userRole === "customer" || !userRole) {
             toast({
              variant: "destructive",
              title: "Access Denied",
              description: "This portal is strictly for staff and administration.",
            })
            setLoading(false)
            return
          }

          // Refresh 1st to update server components with new session
          router.refresh()

          if (userRole === "admin" || userRole === "employee") {
            router.push("/admin/dashboard")
          } else if (['cashier', 'cleaner', 'delivery', 'supervisor'].includes(userRole || '')) {
            router.push(`/staff/${userRole}`)
          }
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccessControlPanel = () => {
    setShowAdminModal(true)
    // adminPhone is already set to default
    setAdminPassword("")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Promotional with Branded Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Static Branded Background */}
        <div className="absolute inset-0 bg-[#0B1221] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ED1C24]/10 rounded-full blur-[100px]" />

          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-start gap-8">
          <Logo size="lg" className="scale-110 origin-left" />
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Management Portal
          </h1>
          <p className="text-lg text-white/90 mb-12 max-w-md drop-shadow-md">
            Sign in to access the TrèsBon DRY CLEANERS internal management system for managing orders, clients, and operations.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4 group">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex-shrink-0 group-hover:bg-white/30 transition-all duration-300">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Track your orders in real-time</h3>
                <p className="text-white/70 text-sm italic">Monitor the status of your laundry from pickup to delivery</p>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex-shrink-0 group-hover:bg-white/30 transition-all duration-300">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Schedule pickups & deliveries</h3>
                <p className="text-white/70 text-sm italic">Convenient scheduling at your preferred time</p>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex-shrink-0 group-hover:bg-white/30 transition-all duration-300">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Access exclusive member benefits</h3>
                <p className="text-white/70 text-sm italic">Enjoy special discounts and priority service</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © {new Date().getFullYear()} TrèsBon DRY CLEANERS. All rights reserved.
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Return to Home
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={(e) => handleLogin(e, true)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900 font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>


          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleAccessControlPanel}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200 opacity-60 hover:opacity-100"
              title="Admin Access"
            >
              <span className="font-light">Admin Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Admin Login</h3>
              <button
                onClick={() => {
                  setShowAdminModal(false)
                  setAdminPhone("0785007239")
                  setAdminPassword("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleLogin(e, false)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPhone" className="text-gray-900 font-medium">
                  Admin Phone
                </Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  placeholder="Enter admin phone number"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-gray-900 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={adminShowPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setAdminShowPassword(!adminShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {adminShowPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAdminModal(false)
                    setAdminPhone("0785007239")
                    setAdminPassword("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                >
                  {loading ? "Verifying..." : "Log In"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

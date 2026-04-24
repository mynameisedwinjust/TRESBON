"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const getDashboardPath = () => {
    if (!session?.user) return "/auth/login"
    return "/admin/dashboard"
  }

  return (
    <nav className="fixed top-0 w-full bg-white z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/services"
              className="text-gray-600 hover:text-laundry-primary font-bold transition-all duration-300 relative group text-base px-3 py-2 rounded-xl hover:bg-laundry-primary/5"
            >
              Services
              <span className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-laundry-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-laundry-primary font-bold transition-all duration-300 relative group text-base px-3 py-2 rounded-xl hover:bg-laundry-primary/5"
            >
              About
              <span className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-laundry-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
            </Link>
          </div>

          <div className="flex items-center gap-3">


            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 border-t border-gray-200/60 pt-6 space-y-2 bg-white/95 backdrop-blur-xl">
            <Link
              href="/services"
              className="block text-gray-700 hover:text-primary font-medium transition-all duration-300 py-3 px-4 rounded-lg hover:bg-primary/5 border-l-4 border-transparent hover:border-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/about"
              className="block text-gray-700 hover:text-primary font-medium transition-all duration-300 py-3 px-4 rounded-lg hover:bg-primary/5 border-l-4 border-transparent hover:border-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

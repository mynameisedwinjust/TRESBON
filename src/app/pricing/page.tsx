import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { servicesData } from "@/lib/services-data"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, ArrowRight, Star, Shield, Clock, Truck } from "lucide-react"

export default function PricingPage() {
  const pricingPlans = [
    {
      name: "Basic",
      price: 15000,
      period: "per order",
      description: "Perfect for regular laundry needs",
      features: [
        "Regular Washing",
        "Drying",
        "Basic Ironing",
        "Standard Processing Time"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: 35000,
      period: "per order",
      description: "Comprehensive care for your garments",
      features: [
        "Regular Washing",
        "Expert Ironing",
        "Stain Removal",
        "Free Delivery",
        "Priority Processing"
      ],
      popular: true
    },
    {
      name: "Deluxe",
      price: 55000,
      period: "per order",
      description: "Ultimate care with premium services",
      features: [
        "All Services Included",
        "Premium Care Treatment",
        "Express Service (24hr)",
        "Free Pickup & Delivery",
        "Priority Support",
        "Quality Guarantee"
      ],
      popular: false
    },
  ]


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for you. All prices are transparent with no hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-xl p-8 border-2 transition-all duration-300 ${plan.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-gray-200 hover:shadow-lg"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-primary">{formatCurrency(plan.price)}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Pricing Table */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Individual Service Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Pay only for the services you need
            </p>
          </div>

          <div className="space-y-12">
            {servicesData.map((service, sIdx) => (
              <div key={sIdx} className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                          Item Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {service.items.map((item, iIdx) => (
                        <tr
                          key={iIdx}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-primary">
                            {formatCurrency(item.price || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Pricing?
            </h2>
            <p className="text-xl text-gray-600">
              Transparent, fair, and value-driven pricing
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Hidden Fees</h3>
              <p className="text-gray-600">Transparent pricing with no surprises</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">100% satisfaction or money back</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Options</h3>
              <p className="text-gray-600">Choose individual services or packages</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-gray-600">Complimentary pickup and delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Access the Staff Portal</h2>
          <Link href="/auth/login">
            <Button size="lg" className="bg-laundry-primary hover:bg-laundry-primary/90 text-white rounded-2xl px-12 py-8 text-xl font-bold shadow-2xl hover:scale-105 transition-all">
              Login to System
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}


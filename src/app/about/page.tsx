import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ServiceImage } from "@/components/service-image"
import { serviceImages } from "@/lib/images"
import {
  Shield,
  Clock,
  Star,
  Truck,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  Heart,
  Leaf,
  Target,
  MapPin
} from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Quality Service",
      description: "Delivering reliable, high-quality cleaning services that enhance customer confidence."
    },
    {
      icon: Star,
      title: "Customer Satisfaction",
      description: "Exceptional customer-centered solutions that prioritize your needs."
    },
    {
      icon: Users,
      title: "Professional Integrity",
      description: "Experienced professionals who handle every garment with care and integrity."
    },
    {
      icon: Leaf,
      title: "Environmental Responsibility",
      description: "Eco-friendly cleaning processes that are safe for you and the planet."
    },
    {
      icon: Clock,
      title: "Reliability & Efficiency",
      description: "Fast turnaround times without compromising on quality."
    }
  ]

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "50,000+", label: "Orders Completed" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "5+", label: "Years of Experience" }
  ]

  const team = [
    {
      name: "Professional Team",
      description: "Our trained staff members are experts in fabric care and garment handling."
    },
    {
      name: "Modern Equipment",
      description: "State-of-the-art cleaning equipment ensures the best results for your clothes."
    },
    {
      name: "Quality Control",
      description: "Every item is inspected before and after cleaning to ensure perfection."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              About TrèsBon
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your trusted partner for professional laundry and dry cleaning services in Rwanda
            </p>
          </div>
        </div>
      </section>

      {/* Story, Mission & Vision Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  TrèsBon DRY CLEANERS is a modern garment care service located in Kicukiro Center, Kigali, Rwanda.
                  The company specializes in professional dry cleaning and laundry solutions designed to maintain
                  garment quality while providing convenience to individuals, businesses, and institutions.
                </p>
                <p>
                  Our goal is to deliver reliable, high-quality cleaning services that enhance customer confidence
                  and extend the life of clothing and fabrics. At TrèsBon, every garment is treated with heart,
                  because looking good feels even better when it's cared for with heart.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
              <ServiceImage
                src={serviceImages.dryCleaning}
                alt="Professional laundry service"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-laundry-primary/5 rounded-3xl p-8 border border-laundry-primary/10">
              <div className="bg-laundry-primary w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                To provide professional, reliable, and eco-friendly garment care services that preserve
                fabric quality while delivering exceptional customer satisfaction.
              </p>
            </div>
            <div className="bg-laundry-secondary/5 rounded-3xl p-8 border border-laundry-secondary/10">
              <div className="bg-laundry-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become Kigali’s most trusted and innovative dry-cleaning service provider through
                quality service, technology adoption, and customer-centered solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Working Hours */}
      <section className="py-16 px-4 bg-white border-y border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center md:col-span-1">
              <div className="text-5xl font-bold text-primary mb-2">7:30 AM</div>
              <div className="text-gray-600 text-lg">Opening Time</div>
            </div>
            <div className="text-center md:col-span-1">
              <div className="text-5xl font-bold text-primary mb-2">10:00 PM</div>
              <div className="text-gray-600 text-lg">Closing Time</div>
            </div>
            <div className="text-center md:col-span-1">
              <div className="text-5xl font-bold text-laundry-secondary mb-2">7 Days</div>
              <div className="text-gray-600 text-lg">Week availability</div>
            </div>
            <div className="text-center md:col-span-1">
              <div className="text-5xl font-bold text-laundry-secondary mb-2">Kicukiro</div>
              <div className="text-gray-600 text-lg">Central Location</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              What drives us every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose TrèsBon?
            </h2>
            <p className="text-xl text-gray-600">
              We deliver excellence in every order
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Staff</h3>
              <p className="text-gray-600">Experienced garment-care professionals</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">Green cleaning processes</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Service</h3>
              <p className="text-gray-600">Quick turnaround times</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized</h3>
              <p className="text-gray-600">Customized customer experience</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Central</h3>
              <p className="text-gray-600">Convenient Kicukiro location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team & Process */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Process
            </h2>
            <p className="text-xl text-gray-600">
              How we ensure quality in every step
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {item.name}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            TrèsBon Management System
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Access the internal system designed for TrèsBon staff and administration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/login">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8">
                Staff Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


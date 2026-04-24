// Comprehensive list of services and their possible items
import { serviceImages } from './images'

export interface ServiceItem {
  name: string
  description?: string
  price?: number
}

export interface ServiceData {
  name: string
  type: string
  base_price: number
  description: string
  imageUrl?: string
  items: ServiceItem[]
}

export const servicesData: ServiceData[] = [
  {
    name: "Advanced stain removal",
    type: "stain_removal",
    base_price: 0,
    description: "Specialized treatment for tough stains",
    imageUrl: serviceImages.stainRemoval,
    items: [
      { name: "Basic Stain Removal", price: 8000 },
      { name: "Advanced Stain Removal", price: 15000 },
    ]
  },
  {
    name: "Wedding gowns and special garment care",
    type: "dry_cleaning",
    base_price: 0,
    description: "Specialized care for wedding gowns, umushanana, and delicate garments",
    imageUrl: serviceImages.women,
    items: [
      { name: "Wedding Gown", price: 12000 },
      { name: "Umushanana", price: 4000 },
      { name: "Dress / Robe", price: 4000 },
      { name: "Ensemble", price: 4500 },
      { name: "Military Uniform", price: 4500 }
    ]
  },
  {
    name: "Corporate, hotel, and institutional laundry services",
    type: "washing",
    base_price: 0,
    description: "Comprehensive laundry services for institutions, hotels, and general clothing",
    imageUrl: serviceImages.washing,
    items: [
      { name: "Suit / Costume", price: 4500 },
      { name: "Shirt / Chemise", price: 2000 },
      { name: "Trouser / Pantalon", price: 2000 },
      { name: "Jacket", price: 3000 },
      { name: "Coat / Veste", price: 3000 },
      { name: "Blouse", price: 1500 },
      { name: "Skirt / Jupe", price: 2000 },
      { name: "T-Shirt", price: 1500 },
      { name: "Tie / Cravate", price: 500 },
      { name: "Socks / Chaussette", price: 500 },
      { name: "Undergarments / Underpaints", price: 1500 },
      { name: "Shorts / Culotte", price: 1500 },
      { name: "Overcoat / Manteau", price: 4000 },
      { name: "Inner Jacket / Gilet", price: 1000 },
      { name: "Cap / Chapeau", price: 1000 },
      { name: "Bed Cover (Big)", price: 12000 },
      { name: "Bed Cover (Small)", price: 8000 },
      { name: "Duvet", price: 5000 },
      { name: "Curtains (Big)", price: 7000 },
      { name: "Curtains (Small)", price: 5000 },
      { name: "Curtains (Net)", price: 5000 },
      { name: "Bed Sheets (1 Pair)", price: 5000 },
      { name: "Blankets", price: 6000 },
      { name: "Big Blankets", price: 8000 },
      { name: "Towel (Big)", price: 4000 },
      { name: "Towel (Small)", price: 2000 },
      { name: "Little Towels", price: 1500 },
      { name: "Tablecloth (Big) 1 PC", price: 4000 },
      { name: "Tablecloth (Small) 1 PC", price: 3000 },
      { name: "Seat Case 1 PC", price: 1000 },
      { name: "Bathrobe", price: 4000 },
      { name: "Handkerchief", price: 500 },
    ]
  },
  {
    name: "Iron & Pressing services",
    type: "ironing",
    base_price: 0,
    description: "Professional ironing and pressing service",
    imageUrl: serviceImages.ironing,
    items: [
      { name: "Suit Pressing", price: 2000 },
      { name: "Shirt Pressing", price: 1000 },
      { name: "Trouser Pressing", price: 1000 },
      { name: "Bedsheet Pressing", price: 2000 },
    ]
  },
  {
    name: "Express Services",
    type: "washing",
    base_price: 0,
    description: "Priority processing with 24-hour turnaround",
    imageUrl: serviceImages.express,
    items: [
      { name: "Express Laundry (Small Load)", price: 15000 },
      { name: "Express Laundry (Large Load)", price: 25000 },
    ]
  }
]


// Helper function to get items for a service
export function getItemsForService(serviceType: string): ServiceItem[] {
  const service = servicesData.find(s => s.type === serviceType || s.name.toLowerCase().includes(serviceType.toLowerCase()))
  return service?.items || []
}

// Helper function to get service by ID or name
export function getServiceData(serviceIdOrName: string, services: any[]): ServiceData | null {
  // First try to find by matching with database service
  const dbService = services.find(s => s.id === serviceIdOrName || s.name === serviceIdOrName)
  if (dbService) {
    const serviceData = servicesData.find(s =>
      s.type === dbService.type ||
      s.name.toLowerCase() === dbService.name.toLowerCase()
    )
    return serviceData || null
  }
  return null
}

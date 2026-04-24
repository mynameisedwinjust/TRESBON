// Image Configuration for TrèsBon DRY CLEANERS
// All images are now sourced from local public/images folder
// Fallbacks are generated as lightweight SVGs in the brand colors

/**
 * Carousel Images shown on the Landing Page Hero section
 * To add your own images:
 * 1. Drop your files into public/images/carousel/
 * 2. Update these paths if names are different
 */
/**
 * Carousel Images shown on the Landing Page Hero section
 * Each item in this array will generate a 404 in your terminal if the file doesn't exist.
 * By default, we use placeholders to keep your terminal clean.
 */
export const carouselImages: string[] = [
  "/images/carousel/Slide 1.png",
  "/images/carousel/Slide 2.png",
  "/images/carousel/Slide 3.png",
  "/images/carousel/Slide 4.png",
]

/**
 * Service Images shown in the services section and cards.
 * We use placeholders by default so you don't see 404 errors.
 */
export const serviceImages = {
  washing: generatePlaceholderImage("service", "Washing"),
  dryCleaning: generatePlaceholderImage("service", "Dry Cleaning"),
  ironing: generatePlaceholderImage("service", "Ironing"),
  folding: generatePlaceholderImage("service", "Folding"),
  stainRemoval: generatePlaceholderImage("service", "Stain Removal"),
  delivery: generatePlaceholderImage("service", "Delivery"),
  express: generatePlaceholderImage("service", "Express"),
  household: generatePlaceholderImage("service", "Household"),
  men: generatePlaceholderImage("service", "Men's Collection"),
  women: generatePlaceholderImage("service", "Women's Collection"),
}

/**
 * Generates a brand-styled placeholder SVG at runtime
 * This is used whenever a local image file is missing or fails to load
 * Extremely fast and requires no external network requests
 */
export function generatePlaceholderImage(type: "carousel" | "service", label?: string, index?: number): string {
  const width = type === "carousel" ? 1920 : 800
  const height = type === "carousel" ? 600 : 600
  const displayText = label || (type === "carousel" ? `Gallery ${index ? index + 1 : ""}` : "TrèsBon Service")

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ED1C24;stop-opacity:0.05" />
          <stop offset="100%" style="stop-color:#0071BC;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#brandGrad)"/>
      <rect width="100%" height="100%" fill="#ffffff" fill-opacity="0.05"/>
      <text x="50%" y="48%" font-family="system-ui, -apple-system, sans-serif" font-size="42" fill="#ED1C24" text-anchor="middle" font-weight="900" style="letter-spacing:-1px">TrèsBon</text>
      <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#0071BC" text-anchor="middle" font-weight="700" opacity="0.8">${displayText.toUpperCase()}</text>
    </svg>
  `.trim()

  const encoded = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(svg))) : Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${encoded}`
}

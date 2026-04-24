# Adding AI-Generated Images to IMESERO

## Overview
This guide explains how to add AI-generated images featuring Black people in Rwanda for the dry cleaning business.

## Image Requirements

### Carousel Images (Hero Section)
- **Location**: `src/lib/images.ts` - `carouselImages` array
- **Dimensions**: 1200x600px (2:1 ratio)
- **Format**: JPG or PNG
- **Content**: Should show:
  - Black people working in a dry cleaning/laundry business
  - Professional setting in Rwanda
  - Examples: Staff cleaning clothes, ironing, organizing garments, customer service
  - 4-5 images total for the carousel

### Service Images
- **Location**: `src/lib/images.ts` - `serviceImages` object
- **Dimensions**: 400x300px (4:3 ratio)
- **Format**: JPG or PNG
- **Services needed**:
  1. **dryCleaning**: Professional dry cleaning process
  2. **washing**: Washing machines or hand washing
  3. **ironing**: Staff ironing clothes
  4. **folding**: Neatly folding and organizing garments
  5. **stainRemoval**: Stain removal process
  6. **delivery**: Delivery person with clean clothes

## How to Add Images

### Option 1: Using Image URLs (Recommended)
1. Generate images using AI tools (Midjourney, DALL-E, Stable Diffusion, etc.)
2. Upload images to a hosting service (Cloudinary, Imgur, Supabase Storage, etc.)
3. Update the URLs in `src/lib/images.ts`:

```typescript
export const carouselImages = [
  "https://your-image-host.com/carousel-1.jpg",
  "https://your-image-host.com/carousel-2.jpg",
  "https://your-image-host.com/carousel-3.jpg",
  "https://your-image-host.com/carousel-4.jpg",
]

export const serviceImages = {
  dryCleaning: "https://your-image-host.com/dry-cleaning.jpg",
  washing: "https://your-image-host.com/washing.jpg",
  ironing: "https://your-image-host.com/ironing.jpg",
  folding: "https://your-image-host.com/folding.jpg",
  stainRemoval: "https://your-image-host.com/stain-removal.jpg",
  delivery: "https://your-image-host.com/delivery.jpg",
}
```

### Option 2: Using Local Images
1. Create a folder: `public/images/`
2. Add your images there:
   - `public/images/carousel-1.jpg`
   - `public/images/carousel-2.jpg`
   - etc.
3. Update the URLs to use local paths:

```typescript
export const carouselImages = [
  "/images/carousel-1.jpg",
  "/images/carousel-2.jpg",
  "/images/carousel-3.jpg",
  "/images/carousel-4.jpg",
]
```

### Option 3: Using Supabase Storage
1. Upload images to Supabase Storage bucket
2. Get public URLs
3. Update the image URLs in `src/lib/images.ts`

## AI Image Generation Prompts

### Carousel Images
Use these prompts for AI image generation:

1. **Professional Dry Cleaning Service**
   ```
   Professional dry cleaning business in Rwanda, Black African staff member 
   carefully handling elegant suits and dresses, modern laundry facility, 
   bright lighting, professional atmosphere, high quality, photorealistic
   ```

2. **Customer Service**
   ```
   Friendly Black African customer service representative at dry cleaning 
   counter in Rwanda, helping customer with order, modern storefront, 
   welcoming atmosphere, professional, photorealistic
   ```

3. **Ironing Service**
   ```
   Professional Black African staff member ironing clothes in modern 
   laundry facility in Rwanda, steam iron, organized workspace, 
   attention to detail, high quality, photorealistic
   ```

4. **Quality Control**
   ```
   Black African quality control specialist inspecting cleaned garments 
   in Rwanda dry cleaning business, checking for perfection, 
   professional setting, photorealistic
   ```

### Service Images
1. **Dry Cleaning**: "Dry cleaning machine with Black African operator in Rwanda, professional equipment, modern facility"
2. **Washing**: "Washing machines in operation, Black African staff member in Rwanda laundry, clean modern facility"
3. **Ironing**: "Black African professional ironing clothes, steam iron, Rwanda laundry service"
4. **Folding**: "Neatly folded clothes organized by Black African staff in Rwanda, professional presentation"
5. **Stain Removal**: "Black African specialist removing stains from garment, professional technique, Rwanda"
6. **Delivery**: "Black African delivery person with clean clothes, professional uniform, Rwanda, friendly service"

## Image Optimization Tips

1. **File Size**: Keep images under 500KB for fast loading
2. **Format**: Use WebP for best compression, or optimized JPG
3. **Alt Text**: Images automatically have alt text based on context
4. **Lazy Loading**: The carousel component handles this automatically

## Current Placeholder Images

Currently, the site uses Unsplash placeholder images. These will automatically fall back to SVG placeholders if the images fail to load.

## Testing

After adding images:
1. Clear browser cache
2. Check carousel on homepage
3. Verify service images load correctly
4. Test on mobile devices
5. Check image loading performance

## Notes

- All images should feature Black people to represent Rwanda authentically
- Images should show professional, modern dry cleaning/laundry operations
- Maintain consistent style and quality across all images
- Ensure images are culturally appropriate and respectful


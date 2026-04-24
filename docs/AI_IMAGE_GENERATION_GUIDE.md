# AI Image Generation Guide for IMESERO

## Overview
This guide provides prompts and instructions for generating AI images featuring Black people in Rwanda for the IMESERO laundry service website.

## ⚠️ IMPORTANT: All Images Must Be Unique
Each image must be completely different from all others. Do NOT reuse the same image for multiple services or carousel slides.

## Image Requirements
- **Subject**: Black people (men and women)
- **Location**: Rwanda setting/context
- **Style**: Professional, clean, modern
- **Quality**: High resolution (minimum 1200x600 for carousel, 800x600 for services)
- **Format**: JPG or PNG

## Carousel Images (Home Page)
Generate 4 different images showing various aspects of the laundry business:

### Image 1: Happy Black Family with Clean Laundry (Hero Carousel)
**Prompt**: "Happy Black family in Rwanda - mother, father, and two young daughters smiling and holding stacks of freshly folded laundry, warm indoor setting with natural light, family portrait style, professional photography, Rwanda context, high quality 4K photorealistic"

**Dimensions**: 1920x600 (wide format)
**Style**: Family-friendly, warm, inviting

### Image 2: Professional Laundry Service (Hero Carousel)
**Prompt**: "Professional Black person in Rwanda working at a modern laundry service, washing machine in background, clean and organized workspace, bright lighting, professional uniform, smiling, Rwanda setting, high quality 4K photorealistic"

**Dimensions**: 1920x600 (wide format)
**Style**: Professional, clean, modern

### Image 3: Ironing Service (Hero Carousel)
**Prompt**: "Black person in Rwanda professionally ironing clothes, steam iron, organized workspace, neatly pressed garments hanging, professional laundry service setting, Rwanda context, high quality 4K photorealistic"

**Dimensions**: 1920x600 (wide format)
**Style**: Professional, detailed work

### Image 4: Delivery Service (Hero Carousel)
**Prompt**: "Black delivery person in Rwanda with laundry delivery bags, professional uniform, clean vehicle or motorcycle, friendly expression, Rwanda street setting, modern laundry service, high quality 4K photorealistic"

**Dimensions**: 1920x600 (wide format)
**Style**: Friendly, professional, outdoor

## Service-Specific Images

### 1. Regular Washing
**Prompt**: "Black person in Rwanda washing clothes in professional laundry setting, washing machine, clean workspace, organized environment, professional attire, Rwanda context, high quality, photorealistic"

### 2. Dry Cleaning
**Prompt**: "Black professional in Rwanda handling formal wear for dry cleaning, suits and dresses, modern dry cleaning facility, professional setting, Rwanda context, high quality, photorealistic"

### 3. Iron & Press
**Prompt**: "Black person in Rwanda ironing clothes professionally, steam iron, pressed garments, organized workspace, professional laundry service, Rwanda setting, high quality, photorealistic"

### 4. Folding Service
**Prompt**: "Black person in Rwanda folding laundry neatly, organized stacks of clean clothes, professional folding technique, clean workspace, Rwanda laundry service, high quality, photorealistic"

### 5. Stain Removal
**Prompt**: "Black professional in Rwanda treating stains on clothing, specialized cleaning tools, focused work, professional laundry service setting, Rwanda context, high quality, photorealistic"

### 6. Express Service
**Prompt**: "Black person in Rwanda working quickly at express laundry service, fast-paced professional environment, modern equipment, efficient service, Rwanda setting, high quality, photorealistic"

### 7. Bulk Washing
**Prompt**: "Black person in Rwanda handling large quantities of laundry, bulk washing machines, organized large-scale operation, professional laundry service, Rwanda context, high quality, photorealistic"

### 8. Delicate Wash
**Prompt**: "Black professional in Rwanda carefully handling delicate fabrics, gentle washing process, silk and wool items, careful attention, professional laundry service, Rwanda setting, high quality, photorealistic"

## Image Generation Tools

### Recommended Tools:
1. **DALL-E 3** (OpenAI) - https://openai.com/dall-e-3
2. **Midjourney** - https://midjourney.com
3. **Stable Diffusion** - https://stability.ai
4. **Adobe Firefly** - https://firefly.adobe.com

### Steps:
1. Use the prompts above with your chosen AI image generator
2. Generate images with the specified dimensions
3. Download the generated images
4. Upload to a hosting service (Supabase Storage, Cloudinary, or similar)
5. Update the URLs in:
   - `src/lib/images.ts` (for carousel images)
   - `src/lib/services-data.ts` (for service images)

## Uploading Images

### Option 1: Supabase Storage
1. Go to Supabase Dashboard → Storage
2. Create a bucket named `service-images` (public)
3. Upload images to appropriate folders
4. Get public URLs and update the code

### Option 2: Cloudinary
1. Sign up at https://cloudinary.com
2. Upload images
3. Get optimized URLs
4. Update the code with new URLs

### Option 3: Direct Hosting
1. Upload to your own server/CDN
2. Update URLs in the code files

## Updating the Code

After generating and uploading images:

1. **Update Carousel Images** (`src/lib/images.ts`):
```typescript
export const carouselImages = [
  "YOUR_IMAGE_URL_1",
  "YOUR_IMAGE_URL_2",
  "YOUR_IMAGE_URL_3",
  "YOUR_IMAGE_URL_4",
]
```

2. **Update Service Images** (`src/lib/services-data.ts`):
```typescript
{
  name: "Service Name",
  imageUrl: "YOUR_SERVICE_IMAGE_URL",
  // ...
}
```

## Tips for Better Results

1. **Be Specific**: Include details about setting, lighting, and mood
2. **Consistent Style**: Use similar prompts for consistency
3. **Rwanda Context**: Include subtle Rwanda elements (architecture, landscape hints)
4. **Professional Look**: Emphasize clean, modern, professional environment
5. **Diversity**: Show both men and women in different roles
6. **Quality**: Always request high resolution and photorealistic style

## Example Full Prompt

"Professional Black woman in Rwanda working at a modern laundry service, washing machine in background, clean white workspace, bright natural lighting, wearing professional uniform, smiling warmly, Rwanda architecture visible through window, high quality 4K photorealistic image, professional photography style"


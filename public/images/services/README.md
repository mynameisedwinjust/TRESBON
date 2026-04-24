# Service Images

Place your service images in this folder with the following filenames:

1. **dry-cleaning.jpg** - Image of a man holding a dry-cleaned blazer (for Dry Cleaning service)
2. **washing.jpg** - Image of washing machines with laundry (for Washing services)
3. **ironing.jpg** - Image of an iron on an ironing board (for Ironing services)
4. **folding.jpg** - Image of a man folding laundry (for Folding services)
5. **delivery.jpg** - Image of a delivery person with boxes (for Delivery and Pickup services)
6. **stain-removal.jpg** - Image of cleaning supplies (for Stain Removal services)

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended dimensions**: 800x600px (4:3 ratio)
- **File size**: Optimize for web (under 500KB recommended)

## Where These Images Are Used

- `src/lib/services-data.ts` - Service data with imageUrl properties
- `src/lib/images.ts` - Service images object for homepage and other displays
- `src/app/customer/services/page.tsx` - Services listing page
- `src/app/page.tsx` - Homepage services section

After adding your images with the correct filenames, they will automatically be used throughout the application.


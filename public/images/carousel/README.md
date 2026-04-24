# Carousel Images Folder

This folder contains all the sliding images that appear on the home page carousel.

## How to Add Images

1. Add your image files to this folder (`public/images/carousel/`)
2. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
3. After adding images, update the `carouselImages` array in `src/lib/images.ts` to include the new image paths

## Example

If you add an image named `my-image.jpg` to this folder, add this line to `src/lib/images.ts`:

```typescript
"/images/carousel/my-image.jpg",
```

The images will automatically appear in the carousel on the home page and will slide automatically.


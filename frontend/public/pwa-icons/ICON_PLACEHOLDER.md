# PWA Icon Placeholder

## Required Icons

This directory should contain the following icons for the Progressive Web App:

### Icon Sizes Needed:
- **icon-72x72.png** - For Android Chrome
- **icon-96x96.png** - For Android Chrome
- **icon-128x128.png** - For Android Chrome
- **icon-144x144.png** - For Windows
- **icon-152x152.png** - For iOS Safari
- **icon-192x192.png** - Standard PWA icon
- **icon-384x384.png** - Larger devices
- **icon-512x512.png** - Maximum size (splash screens)

### How to Generate Icons:

1. **Using Online Tools:**
   - Visit: https://realfavicongenerator.net/
   - Upload your logo (ideally 512x512 PNG)
   - Download generated icons

2. **Using ImageMagick (Command Line):**
   ```bash
   convert logo.png -resize 72x72 icon-72x72.png
   convert logo.png -resize 96x96 icon-96x96.png
   convert logo.png -resize 128x128 icon-128x128.png
   convert logo.png -resize 144x144 icon-144x144.png
   convert logo.png -resize 152x152 icon-152x152.png
   convert logo.png -resize 192x192 icon-192x192.png
   convert logo.png -resize 384x384 icon-384x384.png
   convert logo.png -resize 512x512 icon-512x512.png
   ```

3. **Using Node.js Package:**
   ```bash
   npm install -g pwa-asset-generator
   pwa-asset-generator logo.png ./public/pwa-icons
   ```

### Temporary Solution:

For now, you can copy your existing logo (nuviacare-logo.png) to each size:
- Use an image editor like GIMP, Photoshop, or Photopea
- Resize to each required dimension
- Save with appropriate filename

### Icon Requirements:
- Format: PNG
- Background: Transparent OR solid color (#0d9488 teal)
- Content: NuviaCare logo + heartbeat icon
- Safe area: Keep important elements within 80% of icon size
- Design: Simple, recognizable at small sizes

### Maskable Icons:
All icons should work as "maskable" icons for adaptive icons on Android.
This means the important content should be in the center 80% of the image.


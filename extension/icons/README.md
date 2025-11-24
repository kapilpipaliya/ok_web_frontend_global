# Extension Icons

This directory needs icon files for the Chrome extension. You need to create the following PNG files:

- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## How to Create Icons

### Option 1: Use YSaar Logo
Export the YSaar square logo from `/api/file/downloadCompanySquareLogo` at different sizes.

### Option 2: Create Custom Extension Icons
Design a simple icon that represents saving YouTube content, such as:
- A YouTube play button with a bookmark/save icon
- The YSaar logo with a small YouTube badge

### Tools You Can Use
- **Figma** - Design and export at multiple sizes
- **Adobe Illustrator** - Create vector and export as PNG
- **Online Icon Generators** - Use services like favicon.io or realfavicongenerator.net
- **ImageMagick** (command line):
  ```bash
  # If you have a larger source image (e.g., 512x512):
  convert source.png -resize 16x16 icon16.png
  convert source.png -resize 32x32 icon32.png
  convert source.png -resize 48x48 icon48.png
  convert source.png -resize 128x128 icon128.png
  ```

## Temporary Workaround

For development/testing, you can use placeholder icons:
1. Create a simple colored square at each size
2. Or download free icons from sites like flaticon.com or icons8.com
3. Make sure they're PNG format with transparency

## Final Production Icons

For production, ensure:
- Icons are clear and recognizable at all sizes
- Use transparent backgrounds (PNG with alpha channel)
- Icons match YSaar's brand colors (#3498db for primary blue)
- Test icons in both light and dark Chrome themes

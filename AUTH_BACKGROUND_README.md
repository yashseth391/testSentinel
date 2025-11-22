# Authentication Background Image Setup

## Image Location

Place your background image at: `public/auth-background.webp`

The `public` folder in Vite serves static assets that will be copied to the root of the build output.

## Recommended Specifications

- **Format**: WebP (for optimal compression and quality)
- **Resolution**: 1920x1080 or higher
- **Aspect Ratio**: 16:9 (works well for most screens)
- **File Size**: < 500KB for fast loading
- **Style**: Dark or neutral tones work best (the image will be dimmed by 60% automatically)

## Where to Find Images

You can use free stock images from:

- Unsplash (https://unsplash.com/)
- Pexels (https://www.pexels.com/)
- Pixabay (https://pixabay.com/)

## Converting to WebP

If you have a JPG or PNG, convert it to WebP using:

- Online: https://cloudconvert.com/jpg-to-webp
- Command line: `cwebp input.jpg -o auth-background.webp`

## Current Implementation

The AuthScreen component applies:

- 40% brightness filter (darker background)
- Additional dark overlay (60% opacity)
- Blur effect on the container for glass morphism
- Ensures text remains readable over any background

## Example Search Terms

Good background themes for authentication pages:

- "abstract dark technology"
- "cybersecurity digital background"
- "modern dark gradient"
- "tech circuit board"
- "minimal dark pattern"

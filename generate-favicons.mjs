// Generate favicon images
import sharp from 'sharp';

const generateFavicons = async () => {
  try {
    // Create the base image with IM (Inventory Management) logo
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="256" fill="#004B2E"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="256" font-family="Arial" font-weight="bold">IM</text>
      </svg>
    `;

    // Convert to PNG buffer
    const baseImageBuffer = Buffer.from(svg);

    // Generate different sizes
    const sizes = [16, 32, 48, 64, 180];
    
    for (const size of sizes) {
      const resizedImage = sharp(baseImageBuffer)
        .resize(size, size)
        .png();

      if (size === 48) {
        // This will be our favicon.ico (multiple sizes packed in one ICO file)
        await resizedImage.toFile(`./public/favicon.ico`);
      } else {
        await resizedImage.toFile(`./public/favicon-${size}x${size}.png`);
      }
    }

    console.log('Favicon files generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
};

generateFavicons();
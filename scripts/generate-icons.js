import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create OpenTok logo icon generator
function createIcon(size) {
  const scale = size / 512; // Scale factor from 512px base
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0080ff;stop-opacity:0.8" />
    </radialGradient>
    <filter id="glow-effect">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="#001122" stroke="url(#glow)" stroke-width="4"/>
  
  <!-- Programming brackets -->
  <path d="M 120 120 Q 100 140 120 160 L 140 180 Q 160 200 180 180 L 200 160 Q 220 140 200 120 L 180 100 Q 160 80 140 100 Z" 
        fill="url(#glow)" filter="url(#glow-effect)"/>
  <path d="M 392 120 Q 412 140 392 160 L 372 180 Q 352 200 332 180 L 312 160 Q 292 140 312 120 L 332 100 Q 352 80 372 100 Z" 
        fill="url(#glow)" filter="url(#glow-effect)"/>
  
  <!-- Circuit board elements -->
  <g fill="url(#glow)" filter="url(#glow-effect)">
    <!-- Central circuit lines -->
    <rect x="200" y="200" width="112" height="4" rx="2"/>
    <rect x="200" y="220" width="112" height="4" rx="2"/>
    <rect x="200" y="240" width="112" height="4" rx="2"/>
    <rect x="200" y="260" width="112" height="4" rx="2"/>
    <rect x="200" y="280" width="112" height="4" rx="2"/>
    <rect x="200" y="300" width="112" height="4" rx="2"/>
    
    <!-- Vertical connections -->
    <rect x="220" y="180" width="4" height="40" rx="2"/>
    <rect x="240" y="180" width="4" height="40" rx="2"/>
    <rect x="260" y="180" width="4" height="40" rx="2"/>
    <rect x="280" y="180" width="4" height="40" rx="2"/>
    <rect x="300" y="180" width="4" height="40" rx="2"/>
    
    <rect x="220" y="320" width="4" height="40" rx="2"/>
    <rect x="240" y="320" width="4" height="40" rx="2"/>
    <rect x="260" y="320" width="4" height="40" rx="2"/>
    <rect x="280" y="320" width="4" height="40" rx="2"/>
    <rect x="300" y="320" width="4" height="40" rx="2"/>
    
    <!-- Connection nodes -->
    <circle cx="220" cy="200" r="6"/>
    <circle cx="240" cy="200" r="6"/>
    <circle cx="260" cy="200" r="6"/>
    <circle cx="280" cy="200" r="6"/>
    <circle cx="300" cy="200" r="6"/>
    
    <circle cx="220" cy="300" r="6"/>
    <circle cx="240" cy="300" r="6"/>
    <circle cx="260" cy="300" r="6"/>
    <circle cx="280" cy="300" r="6"/>
    <circle cx="300" cy="300" r="6"/>
  </g>
  
  <!-- Media player controls -->
  <g fill="url(#glow)" filter="url(#glow-effect)">
    <!-- Play button (center) -->
    <circle cx="256" cy="256" r="32"/>
    <polygon points="248,240 248,272 280,256" fill="#001122"/>
    
    <!-- Rewind button (left) -->
    <circle cx="200" cy="256" r="20"/>
    <polygon points="192,244 192,268 208,256" fill="#001122"/>
    <polygon points="208,244 208,268 224,256" fill="#001122"/>
    
    <!-- Fast forward button (right) -->
    <circle cx="312" cy="256" r="20"/>
    <polygon points="304,244 304,268 320,256" fill="#001122"/>
    <polygon points="320,244 320,268 336,256" fill="#001122"/>
  </g>
  
  <!-- Small icons around the circuit -->
  <g fill="url(#glow)" filter="url(#glow-effect)">
    <!-- Camera icon (top left) -->
    <circle cx="160" cy="160" r="12"/>
    <rect x="156" y="156" width="8" height="6" rx="1" fill="#001122"/>
    <circle cx="160" cy="158" r="2" fill="#001122"/>
    
    <!-- Cloud icon (top right) -->
    <ellipse cx="352" cy="160" rx="16" ry="8"/>
    <ellipse cx="348" cy="156" rx="12" ry="6"/>
    
    <!-- Gear icon (bottom left) -->
    <circle cx="160" cy="352" r="12"/>
    <circle cx="160" cy="352" r="6" fill="#001122"/>
    <rect x="158" y="340" width="4" height="8" fill="#001122"/>
    <rect x="158" y="356" width="4" height="8" fill="#001122"/>
    <rect x="148" y="350" width="8" height="4" fill="#001122"/>
    <rect x="164" y="350" width="8" height="4" fill="#001122"/>
    
    <!-- Leaf icon (bottom right) -->
    <ellipse cx="352" cy="352" rx="8" ry="12" transform="rotate(45 352 352)"/>
    <ellipse cx="352" cy="352" rx="6" ry="10" transform="rotate(45 352 352)" fill="#001122"/>
  </g>
</svg>`;
}

// Icon sizes needed for PWA
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons
sizes.forEach(size => {
  const svgContent = createIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Generated ${filename}`);
});

// Create a simple PNG placeholder (base64 encoded 1x1 transparent pixel)
const transparentPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const buffer = Buffer.from(transparentPng, 'base64');
  fs.writeFileSync(path.join(iconsDir, filename), buffer);
  console.log(`Generated ${filename}`);
});

console.log('✅ All OpenTok icons generated successfully!');
console.log('🎨 Using the official OpenTok logo with glowing blue-cyan design');
console.log('📝 Note: PNG files are placeholders. For production, convert the SVG to PNG using a tool like sharp or imagemagick.');

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

console.log('========================================================');
console.log('🚀 Building & Verifying Frontend Static Bundle...');
console.log('========================================================');
console.log(`📁 Frontend Directory: ${PUBLIC_DIR}`);

// 1. Verify essential entry points exist
const requiredFiles = [
  path.join(PUBLIC_DIR, 'index.html'),
  path.join(PUBLIC_DIR, 'admin', 'index.html'),
  path.join(PUBLIC_DIR, 'js', 'api.service.js'),
  path.join(PUBLIC_DIR, 'js', 'renderers.js'),
  path.join(PUBLIC_DIR, 'js', 'app.js'),
  path.join(PUBLIC_DIR, 'admin', 'js', 'admin.service.js'),
  path.join(PUBLIC_DIR, 'admin', 'js', 'admin.ui.js'),
  path.join(PUBLIC_DIR, 'admin', 'js', 'admin.js')
];

let hasErrors = false;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required frontend file: ${path.relative(ROOT_DIR, file)}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('❌ Frontend build validation failed!');
  process.exit(1);
}

// 2. Ensure uploads directory exists in public
const uploadsDir = path.join(PUBLIC_DIR, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 3. Count public assets
const countFiles = (dir) => {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count += 1;
    }
  }
  return count;
};

const totalFiles = countFiles(PUBLIC_DIR);

console.log(`✅ Verified ${totalFiles} static files and assets ready for Nginx serving.`);
console.log('✨ Frontend build completed successfully!');

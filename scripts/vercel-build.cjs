const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
console.log('>>> Voice Hoangha Vercel Build Runner in:', cwd);

const inFrontend = fs.existsSync(path.join(cwd, 'src')) && fs.existsSync(path.join(cwd, 'vite.config.js'));
const targetDir = inFrontend ? cwd : path.join(cwd, 'frontend');

console.log('>>> Building in target directory:', targetDir);

try {
  console.log('>>> Step 1: Installing frontend dependencies...');
  execSync('npm install --legacy-peer-deps', {
    cwd: targetDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });

  console.log('>>> Step 2: Building frontend with Vite...');
  execSync('npm run build', {
    cwd: targetDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  const builtDist = path.join(targetDir, 'dist');
  const rootDist = path.join(cwd, 'dist');

  if (fs.existsSync(builtDist) && !inFrontend) {
    try {
      if (!fs.existsSync(rootDist)) {
        fs.cpSync(builtDist, rootDist, { recursive: true });
        console.log('>>> Copied dist to root dist for Vercel discovery');
      }
    } catch (e) {
      console.warn('Could not copy to root dist:', e.message);
    }
  }

  console.log('>>> Voice Hoangha build completed successfully!');
} catch (error) {
  console.error('>>> Build error:', error.message);
  process.exit(1);
}

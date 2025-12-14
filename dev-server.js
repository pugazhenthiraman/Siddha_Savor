const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Siddha Savor Development Server...');

// Clean up problematic cache directories
function cleanup() {
  const dirsToClean = [
    '.next',
    'node_modules/.prisma',
    'node_modules/.cache'
  ];

  dirsToClean.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
      console.log(`🧹 Cleaning ${dir}...`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });
}

// Start development server with auto-restart
function startServer() {
  console.log('🔄 Starting Next.js development server...');
  
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    console.log('🔄 Restarting server in 3 seconds...');
    setTimeout(() => {
      cleanup();
      startServer();
    }, 3000);
  });

  server.on('exit', (code) => {
    if (code !== 0) {
      console.log(`❌ Server exited with code ${code}`);
      console.log('🔄 Restarting server in 3 seconds...');
      setTimeout(() => {
        cleanup();
        startServer();
      }, 3000);
    }
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down development server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}

// Initial cleanup and start
cleanup();
startServer();

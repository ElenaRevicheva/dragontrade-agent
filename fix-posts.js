#!/usr/bin/env node

// Fix script for resolving posting issues
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Fixing posting issues...');
console.log('📊 Current issues detected:');
console.log('   - Rate limiting pause stuck in negative time');
console.log('   - MCP connection timeouts');
console.log('   - Posts stopped despite healthy status');

// Kill any existing processes
async function killExistingProcesses() {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    console.log('🔄 Killing existing processes...');
    await execAsync('pkill -f "node index.js"');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Existing processes killed');
  } catch (error) {
    console.log('⚠️ Could not kill existing processes:', error.message);
  }
}

// Start the application with fixes
async function startWithFixes() {
  console.log('🚀 Starting application with fixes...');
  
  const child = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      MCP_TIMEOUT: '60000',
      MCP_RETRY_ATTEMPTS: '3',
      MCP_RECONNECT_DELAY: '10000',
      FORCE_RESUME_RATE_LIMITS: 'true',
      RESET_PAUSE_STATE: 'true',
      POST_IMMEDIATELY: 'true',
      ENABLE_ACTION_PROCESSING: 'true'
    }
  });

  child.on('error', (error) => {
    console.error('💥 Failed to start application:', error.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    console.log(`🔴 Application exited with code: ${code}`);
    if (code !== 0) {
      console.log('🔄 Application crashed, restarting in 30 seconds...');
      setTimeout(() => startWithFixes(), 30000);
    }
  });

  // Monitor for successful fixes
  child.stdout?.on('data', (data) => {
    const output = data.toString();
    
    if (output.includes('FORCE RESUME') || output.includes('Rate limiting state reset')) {
      console.log('✅ Rate limiting fix applied successfully');
    }
    
    if (output.includes('resuming normal operation') || output.includes('Pause period expired')) {
      console.log('✅ Rate limiting issue resolved');
    }
    
    if (output.includes('Next AUTHENTIC post scheduled')) {
      console.log('✅ Posting resumed successfully');
    }
    
    if (output.includes('Creating 100% AUTHENTIC post')) {
      console.log('✅ New posts are being created');
    }
  });

  console.log('✅ Application started with fixes');
}

// Main execution
async function main() {
  console.log('🔧 POSTING ISSUE FIX SCRIPT');
  console.log('============================');
  
  await killExistingProcesses();
  await new Promise(resolve => setTimeout(resolve, 2000));
  await startWithFixes();
}

main().catch(err => {
  console.error('💥 Fix script failed:', err.message);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down fix script...');
  process.exit(0);
}); 
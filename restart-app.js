#!/usr/bin/env node

// Restart script for handling MCP timeout issues and rate limiting problems
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AppRestarter {
  constructor() {
    this.maxRestarts = 5;
    this.restartDelay = 30000; // 30 seconds
    this.restartCount = 0;
    this.isRestarting = false;
  }

  async restart() {
    if (this.isRestarting) {
      console.log('🔄 Restart already in progress...');
      return;
    }

    this.isRestarting = true;
    this.restartCount++;

    console.log(`🔄 Restarting application (attempt ${this.restartCount}/${this.maxRestarts})...`);
    console.log(`⏰ Waiting ${this.restartDelay/1000} seconds before restart...`);

    // Wait before restart
    await new Promise(resolve => setTimeout(resolve, this.restartDelay));

    try {
      // Kill existing process if running
      await this.killExistingProcess();

      // Start new process with enhanced environment variables
      const child = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=4096',
          MCP_TIMEOUT: '60000', // Increased timeout
          MCP_RETRY_ATTEMPTS: '3',
          MCP_RECONNECT_DELAY: '10000',
          FORCE_RESUME_RATE_LIMITS: 'true', // Force resume rate limits
          RESET_PAUSE_STATE: 'true' // Reset any stuck pause states
        }
      });

      child.on('error', (error) => {
        console.error('💥 Failed to start application:', error.message);
        this.handleRestartFailure();
      });

      child.on('exit', (code) => {
        console.log(`🔴 Application exited with code: ${code}`);
        
        if (code !== 0 && this.restartCount < this.maxRestarts) {
          console.log('🔄 Application crashed, attempting restart...');
          this.handleRestartFailure();
        } else if (this.restartCount >= this.maxRestarts) {
          console.log('🚫 Max restart attempts reached, stopping restarts');
          process.exit(1);
        }
      });

      // Monitor for specific error patterns
      child.stdout?.on('data', (data) => {
        const output = data.toString();
        
        // Check for rate limiting issues
        if (output.includes('bot paused for -') || output.includes('Skipping post scheduling')) {
          console.log('⚠️ Rate limiting issue detected, will force resume on next restart');
        }
        
        // Check for MCP timeout errors
        if (output.includes('SSE error') || output.includes('Body Timeout Error')) {
          console.log('⚠️ MCP timeout detected, will increase timeout on next restart');
        }
        
        // Check for successful resumption
        if (output.includes('resuming normal operation') || output.includes('Pause period expired')) {
          console.log('✅ Rate limiting issue resolved');
        }
      });

      this.isRestarting = false;
      console.log('✅ Application restarted successfully');

    } catch (error) {
      console.error('💥 Restart failed:', error.message);
      this.handleRestartFailure();
    }
  }

  async killExistingProcess() {
    try {
      // Find and kill existing node processes running index.js
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync('ps aux | grep "node index.js" | grep -v grep');
      
      if (stdout.trim()) {
        console.log('🔄 Killing existing application process...');
        await execAsync('pkill -f "node index.js"');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      }
    } catch (error) {
      console.log('⚠️ Could not kill existing process:', error.message);
    }
  }

  handleRestartFailure() {
    this.isRestarting = false;
    
    if (this.restartCount < this.maxRestarts) {
      console.log(`⏰ Scheduling restart attempt ${this.restartCount + 1}...`);
      setTimeout(() => this.restart(), this.restartDelay);
    } else {
      console.log('🚫 Max restart attempts reached');
      process.exit(1);
    }
  }
}

// Start the restarter
const restarter = new AppRestarter();
restarter.restart();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down restarter...');
  process.exit(0);
}); 
// MCP Health Monitor - Track connection status and diagnose timeout issues
import { CoinGeckoMCPClient } from './coingecko-mcp-client.js';

class MCPHealthMonitor {
  constructor() {
    this.client = new CoinGeckoMCPClient();
    this.healthChecks = [];
    this.isMonitoring = false;
    this.checkInterval = 600000; // Check every 10 minutes (reduced from 1 min to avoid Railway spam)
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3; // Max 3 reconnection attempts per health check
  }

  async startMonitoring() {
    console.log('🏥 Starting MCP Health Monitor...');
    this.isMonitoring = true;
    
    // Initial health check
    await this.performHealthCheck();
    
    // Set up periodic monitoring
    this.monitorInterval = setInterval(async () => {
      if (this.isMonitoring) {
        await this.performHealthCheck();
      }
    }, this.checkInterval);
  }

  async performHealthCheck() {
    if (process.env.COINGECKO_USE_DIRECT_API_ONLY === '1') {
      this.recordHealthCheck('DIRECT_API_ONLY', 'CoinGecko MCP skipped for stability');
      return;
    }
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [${timestamp}] Performing MCP health check...`);
    
    try {
      // Check if client is initialized
      if (!this.client.isConnected) {
        // Limit reconnection attempts to avoid Railway spam
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log(`⚠️ MCP client not connected, skipping reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts} attempts used)`);
          this.recordHealthCheck('SKIPPED_RECONNECT', 'Max reconnection attempts reached, using fallback mode');
          return;
        }
        
        console.log(`⚠️ MCP client not connected, attempting initialization (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
        this.reconnectAttempts++;
        
        const success = await this.client.initialize();
        
        if (success) {
          console.log('✅ MCP client reconnected successfully');
          this.reconnectAttempts = 0; // Reset counter on success
        } else {
          console.log('❌ MCP client reconnection failed');
          this.recordHealthCheck('FAILED_INIT', 'Client initialization failed');
          return;
        }
      }

      // Test connection health
      const isHealthy = await this.client.checkConnectionHealth();
      
      if (isHealthy) {
        console.log('✅ MCP connection is healthy');
        
        // Test a simple operation
        try {
          const btcData = await this.client.getMarketData('BTC');
          console.log('📊 BTC data retrieved successfully:', btcData.price);
          this.recordHealthCheck('HEALTHY', 'Connection and data retrieval working');
        } catch (error) {
          console.log('⚠️ Data retrieval failed:', error.message);
          this.recordHealthCheck('DATA_ERROR', error.message);
        }
      } else {
        console.log('❌ MCP connection is unhealthy');
        this.recordHealthCheck('UNHEALTHY', 'Connection health check failed');
        
        // Attempt reconnection
        console.log('🔄 Attempting to reconnect...');
        this.client.isConnected = false;
        await this.client.initialize();
      }
      
    } catch (error) {
      console.error('💥 Health check failed:', error.message);
      this.recordHealthCheck('ERROR', error.message);
    }
  }

  recordHealthCheck(status, details) {
    const check = {
      timestamp: new Date().toISOString(),
      status,
      details,
      uptime: process.uptime()
    };
    
    this.healthChecks.push(check);
    
    // Keep only last 100 checks
    if (this.healthChecks.length > 100) {
      this.healthChecks = this.healthChecks.slice(-100);
    }
    
    console.log(`📊 Health check recorded: ${status} - ${details}`);
  }

  getHealthSummary() {
    const recentChecks = this.healthChecks.slice(-10);
    const healthyCount = recentChecks.filter(c => c.status === 'HEALTHY').length;
    const totalCount = recentChecks.length;
    const healthPercentage = totalCount > 0 ? (healthyCount / totalCount) * 100 : 0;
    
    return {
      totalChecks: this.healthChecks.length,
      recentHealthPercentage: healthPercentage,
      lastCheck: this.healthChecks[this.healthChecks.length - 1],
      uptime: process.uptime()
    };
  }

  stopMonitoring() {
    console.log('🛑 Stopping MCP Health Monitor...');
    this.isMonitoring = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    
    // Disconnect client
    this.client.disconnect();
  }

  // Print health summary
  printHealthSummary() {
    const summary = this.getHealthSummary();
    console.log('\n📊 MCP Health Summary:');
    console.log(`   Total checks: ${summary.totalChecks}`);
    console.log(`   Recent health: ${summary.recentHealthPercentage.toFixed(1)}%`);
    console.log(`   Uptime: ${Math.floor(summary.uptime / 60)} minutes`);
    
    if (summary.lastCheck) {
      console.log(`   Last check: ${summary.lastCheck.status} - ${summary.lastCheck.details}`);
    }
  }
}

// Export for use in main application
export { MCPHealthMonitor };

// If run directly, start monitoring
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new MCPHealthMonitor();
  
  // Start monitoring
  monitor.startMonitoring();
  
  // Print summary every 5 minutes
  setInterval(() => {
    monitor.printHealthSummary();
  }, 300000);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down MCP Health Monitor...');
    monitor.stopMonitoring();
    process.exit(0);
  });
} 
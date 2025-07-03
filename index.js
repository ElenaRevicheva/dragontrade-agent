import * as elizaCore from '@elizaos/core';
import * as webSearchPlugin from '@elizaos/plugin-web-search';
import * as coinmarketcapPlugin from '@elizaos/plugin-coinmarketcap';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const characterPath = resolve(__dirname, 'character.json');

async function main() {
  try {
    console.log('🚀 Starting DragonTrade Agent...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Check essential environment variables
    const requiredEnvVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      TWITTER_USERNAME: process.env.TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
      TWITTER_EMAIL: process.env.TWITTER_EMAIL
    };
    
    console.log('\n🔐 Environment Check:');
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      console.log(`${key}: ${value ? '✅ SET' : '❌ MISSING'}`);
      if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
    
    // Load character
    console.log('\n📋 Loading character...');
    const character = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    console.log(`Character loaded: ${character.name}`);
    console.log(`Clients: ${character.clients?.join(', ')}`);
    
    // Create database adapter
    console.log('\n🗄️ Creating database adapter...');
    let databaseAdapter;
    
    // Try each adapter type
    if (elizaCore.MemoryCacheAdapter) {
      try {
        databaseAdapter = new elizaCore.MemoryCacheAdapter();
        console.log('✅ MemoryCacheAdapter created');
      } catch (err) {
        console.log('❌ MemoryCacheAdapter failed:', err.message);
      }
    }
    
    if (!databaseAdapter && elizaCore.FsCacheAdapter) {
      try {
        databaseAdapter = new elizaCore.FsCacheAdapter();
        console.log('✅ FsCacheAdapter created');
      } catch (err) {
        console.log('❌ FsCacheAdapter failed:', err.message);
      }
    }
    
    if (!databaseAdapter) {
      throw new Error('Could not create any database adapter');
    }
    
    // Prepare plugins
    console.log('\n🔌 Preparing plugins...');
    const plugins = [];
    
    // Add each plugin safely
    try {
      const webSearch = webSearchPlugin.default || webSearchPlugin;
      if (webSearch) plugins.push(webSearch);
      console.log('✅ Web search plugin added');
    } catch (err) {
      console.log('⚠️ Web search plugin failed:', err.message);
    }
    
    try {
      const coinmarket = coinmarketcapPlugin.default || coinmarketcapPlugin;
      if (coinmarket) plugins.push(coinmarket);
      console.log('✅ CoinMarketCap plugin added');
    } catch (err) {
      console.log('⚠️ CoinMarketCap plugin failed:', err.message);
    }
    
    try {
      const twitter = twitterPlugin.default || twitterPlugin;
      if (twitter) plugins.push(twitter);
      console.log('✅ Twitter plugin added');
    } catch (err) {
      console.log('⚠️ Twitter plugin failed:', err.message);
    }
    
    console.log(`Total plugins loaded: ${plugins.length}`);
    
    // Create minimal runtime config
    const runtimeConfig = {
      character: character,
      modelProvider: 'openai',
      databaseAdapter: databaseAdapter,
      plugins: plugins
    };
    
    // Add token only if available
    if (process.env.OPENAI_API_KEY) {
      runtimeConfig.token = process.env.OPENAI_API_KEY;
    }
    
    console.log('\n🤖 Creating AgentRuntime...');
    console.log('Config:', {
      hasCharacter: !!runtimeConfig.character,
      hasDatabase: !!runtimeConfig.databaseAdapter,
      hasToken: !!runtimeConfig.token,
      pluginCount: runtimeConfig.plugins.length
    });
    
    // Create runtime with error handling
    let runtime;
    try {
      runtime = new elizaCore.AgentRuntime(runtimeConfig);
      console.log('✅ AgentRuntime created');
    } catch (runtimeError) {
      console.error('❌ AgentRuntime creation failed:', runtimeError.message);
      
      // Try with minimal config
      console.log('🔄 Trying minimal configuration...');
      const minimalConfig = {
        character: character,
        modelProvider: 'openai',
        databaseAdapter: databaseAdapter
      };
      
      runtime = new elizaCore.AgentRuntime(minimalConfig);
      console.log('✅ Minimal AgentRuntime created');
    }
    
    // Initialize runtime
    console.log('\n🔄 Initializing runtime...');
    await runtime.initialize();
    console.log('✅ Runtime initialized');
    
    // Check what's available
    console.log('\n📊 Runtime Status:');
    console.log('- Character name:', runtime.character?.name);
    console.log('- Model provider:', runtime.modelProvider);
    console.log('- Has clients:', !!runtime.clients);
    console.log('- Available clients:', runtime.clients ? Object.keys(runtime.clients) : 'none');
    
    if (runtime.clients?.twitter) {
      console.log('- Twitter client type:', typeof runtime.clients.twitter);
      console.log('✅ Twitter client is available!');
    } else {
      console.log('⚠️ Twitter client not found');
    }
    
    console.log('\n🎉 DragonTrade Agent Started Successfully!');
    console.log('🚀 Agent is now running and monitoring for activity...');
    console.log('📱 Expected posting: Every 90-180 minutes');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    
    // Simple monitoring
    let minutes = 0;
    setInterval(() => {
      minutes++;
      console.log(`[${new Date().toISOString()}] 🐉 Running: ${minutes} minutes`);
      
      // Show posting countdown every 30 minutes
      if (minutes % 30 === 0) {
        console.log(`📊 Status: Agent active, next post window: ${90 - (minutes % 90)}-${180 - (minutes % 180)} minutes`);
      }
    }, 60000);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      try {
        if (runtime?.stop) await runtime.stop();
      } catch (err) {
        console.error('Shutdown error:', err.message);
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    // Show debug info
    console.error('\n🔍 Debug Info:');
    console.error('- ElizaCore available:', !!elizaCore);
    console.error('- AgentRuntime available:', !!elizaCore.AgentRuntime);
    console.error('- MemoryCacheAdapter available:', !!elizaCore.MemoryCacheAdapter);
    console.error('- Character file exists:', fs.existsSync(characterPath));
    
    process.exit(1);
  }
}

console.log('🌟 Initializing DragonTrade Agent...');
main().catch(err => {
  console.error('💥 Startup failed:', err);
  process.exit(1);
});
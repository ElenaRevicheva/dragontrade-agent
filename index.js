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
const character = JSON.parse(fs.readFileSync(characterPath, 'utf8'));

async function main() {
  try {
    console.log('🚀 ===== DRAGONTRADE AGENT MAXIMUM DEBUG MODE =====');
    console.log('⏰ Startup Time:', new Date().toISOString());
    
    // Environment Check
    console.log('\n🔐 ===== ENVIRONMENT VARIABLES CHECK =====');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `SET (${process.env.OPENAI_API_KEY.substring(0, 20)}...)` : '❌ MISSING');
    console.log('TWITTER_USERNAME:', process.env.TWITTER_USERNAME || '❌ MISSING');
    console.log('TWITTER_PASSWORD:', process.env.TWITTER_PASSWORD ? 'SET' : '❌ MISSING');
    console.log('TWITTER_EMAIL:', process.env.TWITTER_EMAIL || '❌ MISSING');
    console.log('TWITTER_2FA_SECRET:', process.env.TWITTER_2FA_SECRET ? 'SET' : '❌ MISSING');
    console.log('POST_IMMEDIATELY:', process.env.POST_IMMEDIATELY);
    console.log('ENABLE_ACTION_PROCESSING:', process.env.ENABLE_ACTION_PROCESSING);
    console.log('MAX_ACTIONS_PROCESSING:', process.env.MAX_ACTIONS_PROCESSING);
    console.log('POST_INTERVAL_MIN:', process.env.POST_INTERVAL_MIN);
    console.log('POST_INTERVAL_MAX:', process.env.POST_INTERVAL_MAX);
    console.log('TWITTER_POLL_INTERVAL:', process.env.TWITTER_POLL_INTERVAL);
    console.log('COINMARKETCAP_API_KEY:', process.env.COINMARKETCAP_API_KEY ? 'SET' : '❌ MISSING');
    console.log('TAVILY_API_KEY:', process.env.TAVILY_API_KEY ? 'SET' : '❌ MISSING');
    
    // Character File Check
    console.log('\n📋 ===== CHARACTER FILE CHECK =====');
    console.log('Character Name:', character.name);
    console.log('Model Provider:', character.modelProvider);
    console.log('Clients:', character.clients);
    console.log('Plugins:', character.plugins);
    console.log('Post Examples Count:', character.postExamples?.length || 0);
    console.log('First Post Example:', character.postExamples?.[0]?.substring(0, 100) + '...');
    
    // Plugin Analysis
    console.log('\n🔌 ===== PLUGIN ANALYSIS =====');
    console.log('ElizaCore exports:', Object.keys(elizaCore).slice(0, 20), '... (showing first 20)');
    console.log('WebSearch exports:', Object.keys(webSearchPlugin));
    console.log('CoinMarketCap exports:', Object.keys(coinmarketcapPlugin));
    console.log('Twitter exports:', Object.keys(twitterPlugin));
    
    // AgentRuntime Detection
    console.log('\n🤖 ===== AGENTRUNTIME DETECTION =====');
    console.log('AgentRuntime available:', !!elizaCore.AgentRuntime);
    console.log('AgentRuntime type:', typeof elizaCore.AgentRuntime);
    
    if (elizaCore.AgentRuntime) {
      console.log('🎯 Creating AgentRuntime instance...');
      
      const runtimeConfig = {
        character: character,
        modelProvider: 'openai',
        token: process.env.OPENAI_API_KEY,
        plugins: [
          webSearchPlugin.default || webSearchPlugin,
          coinmarketcapPlugin.default || coinmarketcapPlugin,
          twitterPlugin.default || twitterPlugin
        ]
      };
      
      console.log('📝 Runtime Config:', {
        hasCharacter: !!runtimeConfig.character,
        modelProvider: runtimeConfig.modelProvider,
        hasToken: !!runtimeConfig.token,
        pluginCount: runtimeConfig.plugins.length,
        pluginTypes: runtimeConfig.plugins.map(p => typeof p)
      });
      
      const runtime = new elizaCore.AgentRuntime(runtimeConfig);
      console.log('✅ AgentRuntime instance created successfully');
      
      console.log('🔄 Initializing runtime...');
      await runtime.initialize();
      console.log('✅ Runtime initialized successfully');
      
      // Check if runtime has Twitter client
      console.log('\n🐦 ===== TWITTER CLIENT CHECK =====');
      console.log('Runtime clients:', runtime.clients ? Object.keys(runtime.clients) : 'No clients property');
      console.log('Runtime has Twitter client:', !!(runtime.clients && runtime.clients.twitter));
      
      // If Twitter client exists, get more details
      if (runtime.clients && runtime.clients.twitter) {
        console.log('Twitter client type:', typeof runtime.clients.twitter);
        console.log('Twitter client methods:', Object.getOwnPropertyNames(runtime.clients.twitter));
      }
      
      console.log('\n🎉 ===== DRAGONTRADE AGENT STARTED SUCCESSFULLY =====');
      console.log('⏰ Started at:', new Date().toISOString());
      console.log('🚀 Monitoring for Twitter activity...');
      
      // Enhanced monitoring loop
      let counter = 0;
      const monitoringInterval = setInterval(async () => {
        counter++;
        const timestamp = new Date().toISOString();
        console.log(`\n📊 [${timestamp}] === STATUS CHECK ${counter} ===`);
        console.log('🔄 Agent running time:', counter, 'minutes');
        console.log('💾 Memory usage:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        
        // Check if runtime is still alive
        try {
          if (runtime && typeof runtime.cleanup !== 'undefined') {
            console.log('🤖 Runtime status: ALIVE');
          }
          
          // Check Twitter client status
          if (runtime.clients && runtime.clients.twitter) {
            console.log('🐦 Twitter client: CONNECTED');
          } else {
            console.log('🐦 Twitter client: NOT FOUND');
          }
          
          // Log expected next post time
          const nextPostMin = 90 - (counter % 90);
          const nextPostMax = 180 - (counter % 180);
          console.log('⏰ Next post window: ', nextPostMin, '-', nextPostMax, 'minutes');
          
        } catch (err) {
          console.error('❌ Status check error:', err.message);
        }
        
        console.log('═════════════════════════════════════');
      }, 60000); // Every minute
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n🛑 ===== SHUTTING DOWN DRAGONTRADE AGENT =====');
        clearInterval(monitoringInterval);
        try {
          if (runtime && typeof runtime.stop === 'function') {
            await runtime.stop();
            console.log('✅ Runtime stopped gracefully');
          }
        } catch (err) {
          console.error('❌ Error during shutdown:', err);
        }
        process.exit(0);
      });
      
      // Keep process alive
      process.on('uncaughtException', (err) => {
        console.error('💥 UNCAUGHT EXCEPTION:', err);
        console.error('Stack:', err.stack);
      });
      
      process.on('unhandledRejection', (reason, promise) => {
        console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
      });
      
    } else {
      console.error('❌ AgentRuntime not found in elizaCore exports');
      console.log('Available constructors:', Object.keys(elizaCore).filter(key => 
        typeof elizaCore[key] === 'function' && elizaCore[key].name
      ));
    }
    
  } catch (error) {
    console.error('\n💥 ===== FATAL ERROR =====');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error cause:', error.cause);
    process.exit(1);
  }
}

// Add global error handlers
process.on('warning', (warning) => {
  console.warn('⚠️ Warning:', warning.name, warning.message);
});

console.log('🌟 Starting DragonTrade Agent with MAXIMUM DEBUG...');
main().catch(console.error);
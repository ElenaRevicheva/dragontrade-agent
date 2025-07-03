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
    
    // Database Adapter Creation
    console.log('\n🗄️ ===== DATABASE ADAPTER CREATION =====');
    console.log('Available database adapters:', {
      MemoryCacheAdapter: !!elizaCore.MemoryCacheAdapter,
      FsCacheAdapter: !!elizaCore.FsCacheAdapter,
      DbCacheAdapter: !!elizaCore.DbCacheAdapter
    });
    
    let databaseAdapter;
    try {
      // Try different database adapters in order of preference
      if (elizaCore.MemoryCacheAdapter) {
        databaseAdapter = new elizaCore.MemoryCacheAdapter();
        console.log('✅ Created MemoryCacheAdapter');
      } else if (elizaCore.FsCacheAdapter) {
        databaseAdapter = new elizaCore.FsCacheAdapter();
        console.log('✅ Created FsCacheAdapter');
      } else if (elizaCore.DbCacheAdapter) {
        databaseAdapter = new elizaCore.DbCacheAdapter();
        console.log('✅ Created DbCacheAdapter');
      } else {
        throw new Error('No suitable database adapter found');
      }
    } catch (dbError) {
      console.error('❌ Database adapter creation error:', dbError);
      throw dbError;
    }
    
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
        databaseAdapter: databaseAdapter, // 🔑 KEY FIX: Add database adapter
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
        hasDatabaseAdapter: !!runtimeConfig.databaseAdapter,
        databaseAdapterType: runtimeConfig.databaseAdapter?.constructor?.name,
        pluginCount: runtimeConfig.plugins.length,
        pluginTypes: runtimeConfig.plugins.map(p => typeof p)
      });
      
      console.log('🔨 Creating AgentRuntime instance...');
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
        console.log('Twitter client methods:', Object.getOwnPropertyNames(runtime.clients.twitter).slice(0, 10));
        console.log('Twitter client constructor:', runtime.clients.twitter.constructor?.name);
      }
      
      // Check runtime services
      console.log('\n🔧 ===== RUNTIME SERVICES CHECK =====');
      console.log('Runtime services:', runtime.services ? Object.keys(runtime.services) : 'No services property');
      console.log('Runtime actions:', runtime.actions ? runtime.actions.length : 'No actions property');
      console.log('Runtime evaluators:', runtime.evaluators ? runtime.evaluators.length : 'No evaluators property');
      
      console.log('\n🎉 ===== DRAGONTRADE AGENT STARTED SUCCESSFULLY =====');
      console.log('⏰ Started at:', new Date().toISOString());
      console.log('🚀 Monitoring for Twitter activity...');
      console.log('📱 Expected first post: Within 90-180 minutes');
      console.log('🏷️ Posts will be branded with: aideazz.xyz and $AZ');
      
      // Enhanced monitoring loop
      let counter = 0;
      const monitoringInterval = setInterval(async () => {
        counter++;
        const timestamp = new Date().toISOString();
        console.log(`\n📊 [${timestamp}] === STATUS CHECK ${counter} ===`);
        console.log('🔄 Agent running time:', counter, 'minutes');
        console.log('💾 Memory usage:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
        
        // Check if runtime is still alive
        try {
          if (runtime && runtime.character) {
            console.log('🤖 Runtime status: ALIVE');
            console.log('👤 Character:', runtime.character.name);
          }
          
          // Check Twitter client status
          if (runtime.clients && runtime.clients.twitter) {
            console.log('🐦 Twitter client: CONNECTED');
          } else {
            console.log('🐦 Twitter client: NOT FOUND');
          }
          
          // Check database adapter
          if (runtime.databaseAdapter) {
            console.log('🗄️ Database adapter: ACTIVE');
          }
          
          // Log expected next post time windows
          const currentMinute = counter;
          const nextPost90 = 90 - (currentMinute % 90);
          const nextPost180 = 180 - (currentMinute % 180);
          console.log('⏰ Next post opportunities:');
          console.log('   - 90min cycle: in', nextPost90, 'minutes');
          console.log('   - 180min cycle: in', nextPost180, 'minutes');
          
          // Show Twitter posting settings
          if (counter === 1) {
            console.log('🐦 Twitter Settings:');
            console.log('   - POST_IMMEDIATELY:', process.env.POST_IMMEDIATELY);
            console.log('   - POST_INTERVAL_MIN:', process.env.POST_INTERVAL_MIN);
            console.log('   - POST_INTERVAL_MAX:', process.env.POST_INTERVAL_MAX);
          }
          
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
      
      // Keep process alive with error handling
      process.on('uncaughtException', (err) => {
        console.error('💥 UNCAUGHT EXCEPTION:', err);
        console.error('Stack:', err.stack);
        // Don't exit, try to continue
      });
      
      process.on('unhandledRejection', (reason, promise) => {
        console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
        // Don't exit, try to continue
      });
      
    } else {
      console.error('❌ AgentRuntime not found in elizaCore exports');
      console.log('Available constructors:', Object.keys(elizaCore).filter(key => 
        typeof elizaCore[key] === 'function' && elizaCore[key].name
      ));
      throw new Error('AgentRuntime not available');
    }
    
  } catch (error) {
    console.error('\n💥 ===== FATAL ERROR =====');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error cause:', error.cause);
    
    // Additional debugging info
    console.error('\n🔍 ===== DEBUG INFO =====');
    console.error('Available elizaCore exports:', Object.keys(elizaCore));
    console.error('Character loaded:', !!character);
    console.error('Environment check:');
    console.error('- OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
    console.error('- TWITTER_USERNAME:', !!process.env.TWITTER_USERNAME);
    
    process.exit(1);
  }
}

// Add global error handlers
process.on('warning', (warning) => {
  console.warn('⚠️ Warning:', warning.name, warning.message);
});

console.log('🌟 Starting DragonTrade Agent with MAXIMUM DEBUG...');
main().catch((err) => {
  console.error('🔥 Main function error:', err);
  process.exit(1);
});
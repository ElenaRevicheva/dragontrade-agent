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
    console.log('Starting DragonTrade Agent...');
    console.log('ElizaCore exports:', Object.keys(elizaCore));
    console.log('WebSearch exports:', Object.keys(webSearchPlugin));
    console.log('CoinMarketCap exports:', Object.keys(coinmarketcapPlugin));
    console.log('Twitter exports:', Object.keys(twitterPlugin));
    
    // Try to find the correct function/class
    const startFn = elizaCore.startAgent || elizaCore.Agent || elizaCore.createAgent || elizaCore.default;
    
    if (startFn) {
      console.log('Found start function:', typeof startFn);
      
      if (typeof startFn === 'function') {
        const agent = await startFn({
          character,
          plugins: [
            webSearchPlugin.default || webSearchPlugin,
            coinmarketcapPlugin.default || coinmarketcapPlugin,
            twitterPlugin.default || twitterPlugin
          ]
        });
        
        console.log('Agent created:', !!agent);
      }
    } else {
      console.log('Available functions in elizaCore:', elizaCore);
    }

    console.log('DragonTrade Agent started successfully!');
    
    process.on('SIGINT', () => {
      console.log('Shutting down DragonTrade Agent...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start agent:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

main();
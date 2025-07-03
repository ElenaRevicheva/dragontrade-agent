import { startAgent } from '@elizaos/core';
import webSearchPlugin from '@elizaos/plugin-web-search';
import coinmarketcapPlugin from '@elizaos/plugin-coinmarketcap';
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
    
    const agent = await startAgent({
      character,
      plugins: [
        webSearchPlugin,
        coinmarketcapPlugin
      ],
      clients: ['twitter'],
      modelProvider: 'openai'
    });

    console.log('DragonTrade Agent started successfully!');
    
    process.on('SIGINT', () => {
      console.log('Shutting down DragonTrade Agent...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start agent:', error);
    process.exit(1);
  }
}

main();
import elizaCore from '@elizaos/core';
import webSearchPlugin from '@elizaos/plugin-web-search';
import coinmarketcapPlugin from '@elizaos/plugin-coinmarketcap';
import twitterPlugin from '@elizaos/plugin-twitter';
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
    console.log('Available elizaCore exports:', Object.keys(elizaCore));
    
    // Try to find the correct constructor/function
    const AgentClass = elizaCore.Agent || elizaCore.default || elizaCore;
    
    if (typeof AgentClass === 'function') {
      const agent = new AgentClass({
        character,
        plugins: [
          webSearchPlugin,
          coinmarketcapPlugin,
          twitterPlugin
        ]
      });

      if (agent.start) {
        await agent.start();
      }
    } else if (typeof elizaCore.startAgent === 'function') {
      await elizaCore.startAgent({
        character,
        plugins: [
          webSearchPlugin,
          coinmarketcapPlugin,
          twitterPlugin
        ]
      });
    } else {
      console.log('ElizaCore structure:', elizaCore);
      throw new Error('Could not find Agent constructor or startAgent function');
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
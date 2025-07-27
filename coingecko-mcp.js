// CoinGecko MCP Server Implementation
// This file will handle CoinGecko API integration for the DragonTrade agent

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'coingecko-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions for CoinGecko API
const tools = [
  {
    name: 'get_crypto_price',
    description: 'Get current price of a cryptocurrency by symbol or ID',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Cryptocurrency symbol (e.g., BTC, ETH, SOL)',
        },
        vs_currency: {
          type: 'string',
          description: 'Target currency (default: usd)',
          default: 'usd',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_market_data',
    description: 'Get comprehensive market data for a cryptocurrency',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Cryptocurrency symbol (e.g., BTC, ETH, SOL)',
        },
        vs_currency: {
          type: 'string',
          description: 'Target currency (default: usd)',
          default: 'usd',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_trending_coins',
    description: 'Get trending cryptocurrencies in the last 24 hours',
    inputSchema: {
      type: 'object',
      properties: {
        vs_currency: {
          type: 'string',
          description: 'Target currency (default: usd)',
          default: 'usd',
        },
      },
    },
  },
  {
    name: 'get_global_market_data',
    description: 'Get global cryptocurrency market data',
    inputSchema: {
      type: 'object',
      properties: {
        vs_currency: {
          type: 'string',
          description: 'Target currency (default: usd)',
          default: 'usd',
        },
      },
    },
  },
];

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_crypto_price':
        return await getCryptoPrice(args);
      case 'get_market_data':
        return await getMarketData(args);
      case 'get_trending_coins':
        return await getTrendingCoins(args);
      case 'get_global_market_data':
        return await getGlobalMarketData(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// CoinGecko API functions
async function getCryptoPrice(args) {
  const { symbol, vs_currency = 'usd' } = args;
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=${vs_currency}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get price for ${symbol}: ${error.message}`);
  }
}

async function getMarketData(args) {
  const { symbol, vs_currency = 'usd' } = args;
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get market data for ${symbol}: ${error.message}`);
  }
}

async function getTrendingCoins(args) {
  const { vs_currency = 'usd' } = args;
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search/trending`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get trending coins: ${error.message}`);
  }
}

async function getGlobalMarketData(args) {
  const { vs_currency = 'usd' } = args;
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/global`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to get global market data: ${error.message}`);
  }
}

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.log('CoinGecko MCP Server started'); 
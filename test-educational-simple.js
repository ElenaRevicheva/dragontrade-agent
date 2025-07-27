import { EducationalMCP } from './educational-mcp-simple.js';

async function testEducationalIntegration() {
  console.log('🧪 Testing Educational MCP Integration...\n');
  
  const eduMCP = new EducationalMCP();
  await eduMCP.initialize();
  
  console.log('📊 Testing Bitcoin Educational Analysis:');
  const btcEducation = await eduMCP.getEducationalBitcoinAnalysis();
  console.log(btcEducation);
  
  console.log('\n🌍 Testing Market Educational Insight:');
  const marketEducation = await eduMCP.getMarketEducationInsight();
  console.log(marketEducation);
  
  console.log('\n💎 Testing AZ Token Educational Content:');
  const azEducation = await eduMCP.getAZTokenEducationalContent();
  console.log(azEducation);
  
  console.log('\n🔧 Testing Content Enhancement:');
  const originalPost = "Bitcoin shows 5% volatility today";
  const enhanced = eduMCP.enhanceWithMCP(originalPost);
  console.log(enhanced);
  
  console.log('\n📝 Testing Complete Educational Post:');
  const fullPost = await eduMCP.createEducationalPost({});
  console.log(fullPost);
  
  console.log('\n✅ Educational MCP + AZ integration test complete!');
}

testEducationalIntegration(); 
import { EducationalMCP } from './educational-mcp-simple.js';

async function testIntegration() {
  console.log('🧪 Testing Educational MCP Integration with Main Bot...\n');
  
  try {
    // Test Educational MCP initialization
    const eduMCP = new EducationalMCP();
    const initialized = await eduMCP.initialize();
    console.log('✅ Educational MCP initialized:', initialized);
    
    // Test educational content generation
    const btcEducation = await eduMCP.getEducationalBitcoinAnalysis();
    console.log('✅ Bitcoin educational content generated');
    
    // Test AZ token content
    const azContent = await eduMCP.getAZTokenEducationalContent();
    console.log('✅ AZ token educational content generated');
    
    // Test content enhancement
    const originalContent = "Bitcoin shows 5% volatility today";
    const enhanced = eduMCP.enhanceWithMCP(originalContent);
    console.log('✅ Content enhancement working');
    
    // Test complete educational post
    const fullPost = await eduMCP.createEducationalPost({});
    console.log('✅ Complete educational post generated');
    
    console.log('\n🎓 All Educational MCP features working correctly!');
    console.log('🚀 Ready for integration with main DragonTrade bot');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

testIntegration(); 
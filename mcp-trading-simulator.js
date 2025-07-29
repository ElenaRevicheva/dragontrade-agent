// MCP-Powered Interactive Trading Simulator
// Enhances educational experience with real market data

class MCPTradingSimulator {
  constructor() {
    this.simulations = new Map();
    this.userPortfolios = new Map();
    this.lessonHistory = [];
    this.marketScenarios = [];
  }

  async initialize() {
    console.log('🎓 [MCP TRADING SIMULATOR] Initializing interactive trading simulator...');
    
    // Load market scenarios
    this.loadMarketScenarios();
    
    console.log('✅ [MCP TRADING SIMULATOR] Interactive trading simulator ready');
    return true;
  }

  loadMarketScenarios() {
    this.marketScenarios = [
      {
        name: 'FOMO_TRAP',
        description: 'Everyone is buying - what do you do?',
        marketCondition: 'bullish',
        emotionalTrigger: 'fomo',
        correctAction: 'resist_fomo',
        lesson: 'FOMO leads to buying high and selling low'
      },
      {
        name: 'PANIC_SELL',
        description: 'Market crashes 20% - do you sell?',
        marketCondition: 'bearish',
        emotionalTrigger: 'fear',
        correctAction: 'dca',
        lesson: 'Panic selling locks in losses'
      },
      {
        name: 'MEME_COIN_HYPE',
        description: 'New meme coin pumping 500% - buy?',
        marketCondition: 'speculative',
        emotionalTrigger: 'greed',
        correctAction: 'avoid',
        lesson: 'Meme coins are gambling, not investing'
      },
      {
        name: 'DIP_BUYING',
        description: 'BTC drops 15% - opportunity or trap?',
        marketCondition: 'correction',
        emotionalTrigger: 'opportunity',
        correctAction: 'dca_small',
        lesson: 'Dollar-cost averaging reduces risk'
      }
    ];
  }

  async createSimulation(userId, scenarioType = 'random') {
    try {
      console.log('🎮 [MCP SIMULATOR] Creating new trading simulation...');
      
      const scenario = scenarioType === 'random' 
        ? this.marketScenarios[Math.floor(Math.random() * this.marketScenarios.length)]
        : this.marketScenarios.find(s => s.name === scenarioType);

      const simulation = {
        id: Date.now(),
        userId: userId,
        scenario: scenario,
        portfolio: {
          cash: 10000,
          btc: 0,
          eth: 0,
          other: 0,
          totalValue: 10000
        },
        decisions: [],
        lessons: [],
        startTime: Date.now(),
        marketData: null
      };

      this.simulations.set(simulation.id, simulation);
      
      console.log(`✅ [MCP SIMULATOR] Simulation created: ${scenario.name}`);
      return simulation;
    } catch (error) {
      console.log('⚠️ [MCP SIMULATOR] Failed to create simulation:', error.message);
      return null;
    }
  }

  async presentScenario(simulationId, marketData) {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) return null;

    const scenario = simulation.scenario;
    const btc = marketData.all_coins?.find(c => c.symbol === 'BTC');
    const eth = marketData.all_coins?.find(c => c.symbol === 'ETH');

    let scenarioText = `🎮 ALGOM TRADING SIMULATOR:\n\n📊 SCENARIO: ${scenario.description}\n\n💰 YOUR PORTFOLIO: $${simulation.portfolio.totalValue.toLocaleString()}\n🟠 BTC: $${btc ? btc.price.toLocaleString() : 'N/A'} (${btc ? (btc.change_24h > 0 ? '+' : '') + btc.change_24h.toFixed(2) + '%' : 'N/A'})\n🔵 ETH: $${eth ? eth.price.toLocaleString() : 'N/A'} (${eth ? (eth.change_24h > 0 ? '+' : '') + eth.change_24h.toFixed(2) + '%' : 'N/A'})\n\n🎯 EMOTIONAL TRIGGER: ${scenario.emotionalTrigger.toUpperCase()}\n💡 MARKET CONDITION: ${scenario.marketCondition.toUpperCase()}\n\nWhat would you do?\n\nA) Follow the crowd (FOMO)\nB) Panic and sell everything\nC) Stay calm and DCA\nD) Wait and observe\n\n#TradingSimulator #LearnToTrade #AlgomEducation`;

    return {
      type: 'trading_simulation',
      status: 'educational',
      content: scenarioText,
      simulationId: simulationId,
      scenario: scenario
    };
  }

  async processDecision(simulationId, decision, marketData) {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) return null;

    const scenario = simulation.scenario;
    const decisionData = {
      choice: decision,
      timestamp: Date.now(),
      marketData: marketData
    };

    simulation.decisions.push(decisionData);

    // Analyze the decision
    const analysis = this.analyzeDecision(decision, scenario);
    const lesson = this.generateLesson(analysis, scenario);

    simulation.lessons.push(lesson);

    return {
      type: 'simulation_result',
      status: 'educational',
      content: this.formatSimulationResult(analysis, lesson, simulation),
      analysis: analysis,
      lesson: lesson
    };
  }

  analyzeDecision(decision, scenario) {
    const analysis = {
      correct: false,
      reasoning: '',
      emotionalMistake: false,
      learningOpportunity: ''
    };

    switch (decision) {
      case 'A': // FOMO
        analysis.correct = scenario.correctAction === 'resist_fomo';
        analysis.emotionalMistake = true;
        analysis.reasoning = 'Following the crowd often leads to buying high';
        analysis.learningOpportunity = 'FOMO is an emotional trap';
        break;
      case 'B': // Panic sell
        analysis.correct = scenario.correctAction === 'dca';
        analysis.emotionalMistake = true;
        analysis.reasoning = 'Panic selling locks in losses';
        analysis.learningOpportunity = 'Fear leads to poor decisions';
        break;
      case 'C': // DCA
        analysis.correct = scenario.correctAction.includes('dca');
        analysis.reasoning = 'Dollar-cost averaging reduces risk';
        analysis.learningOpportunity = 'Discipline beats emotion';
        break;
      case 'D': // Wait
        analysis.correct = scenario.correctAction === 'avoid';
        analysis.reasoning = 'Sometimes the best action is no action';
        analysis.learningOpportunity = 'Patience is a trading skill';
        break;
    }

    return analysis;
  }

  generateLesson(analysis, scenario) {
    const lesson = {
      title: scenario.lesson,
      keyTakeaway: analysis.learningOpportunity,
      emotionalAspect: analysis.emotionalMistake ? 'EMOTIONAL MISTAKE' : 'RATIONAL DECISION',
      recommendation: this.getRecommendation(scenario.correctAction)
    };

    return lesson;
  }

  getRecommendation(correctAction) {
    const recommendations = {
      'resist_fomo': 'Stay disciplined and stick to your plan',
      'dca': 'Dollar-cost average during dips',
      'avoid': 'Sometimes the best trade is no trade',
      'dca_small': 'Small, regular investments reduce risk'
    };

    return recommendations[correctAction] || 'Always DYOR and manage risk';
  }

  formatSimulationResult(analysis, lesson, simulation) {
    const emoji = analysis.correct ? '✅' : '❌';
    const resultText = analysis.correct ? 'CORRECT DECISION' : 'EMOTIONAL MISTAKE';

    return `${emoji} ALGOM SIMULATION RESULT:\n\n🎯 YOUR DECISION: ${resultText}\n💡 REASONING: ${analysis.reasoning}\n\n🎓 LESSON LEARNED:\n• ${lesson.title}\n• ${lesson.keyTakeaway}\n• ${lesson.recommendation}\n\n🧠 EMOTIONAL ASPECT: ${lesson.emotionalAspect}\n\n💡 PRO TIP: ${this.getProTip(simulation.scenario)}\n\n#TradingEducation #LearnFromMistakes #AlgomSimulator`;
  }

  getProTip(scenario) {
    const proTips = {
      'FOMO_TRAP': 'If everyone is buying, the smart money is selling',
      'PANIC_SELL': 'The best time to buy is when others are fearful',
      'MEME_COIN_HYPE': 'If it sounds too good to be true, it probably is',
      'DIP_BUYING': 'Be greedy when others are fearful, fearful when others are greedy'
    };

    return proTips[scenario.name] || 'Always have a plan and stick to it';
  }

  async createPersonalizedLesson(userBehavior, marketData) {
    // MCP-powered personalized lesson creation
    const lesson = {
      type: 'personalized_lesson',
      status: 'educational',
      content: this.generatePersonalizedContent(userBehavior, marketData)
    };

    return lesson;
  }

  generatePersonalizedContent(userBehavior, marketData) {
    const positiveRatio = marketData.positive_coins / marketData.total_coins;
    
    let lessonContent = `🎓 ALGOM PERSONALIZED LESSON:\n\n📊 CURRENT MARKET: ${positiveRatio > 0.7 ? 'GREEDY' : positiveRatio < 0.3 ? 'FEARFUL' : 'NEUTRAL'}\n\n`;

    if (userBehavior.panicSells > 3) {
      lessonContent += `⚠️ YOUR PATTERN: You tend to panic sell during dips\n💡 SOLUTION: Set stop losses to prevent emotional decisions\n\n`;
    }

    if (userBehavior.fomoBuys > 5) {
      lessonContent += `⚠️ YOUR PATTERN: You FOMO buy at peaks\n💡 SOLUTION: Use dollar-cost averaging instead\n\n`;
    }

    if (userBehavior.memeCoinPercentage > 50) {
      lessonContent += `⚠️ YOUR PATTERN: Too much meme coin exposure\n💡 SOLUTION: Diversify: 70% BTC/ETH, 20% top 10, 10% speculation\n\n`;
    }

    lessonContent += `🎯 TODAY'S FOCUS: ${this.getDailyFocus(marketData)}\n\n#PersonalizedEducation #TradingPsychology #AlgomCoach`;

    return lessonContent;
  }

  getDailyFocus(marketData) {
    const positiveRatio = marketData.positive_coins / marketData.total_coins;
    
    if (positiveRatio > 0.8) {
      return 'Resist FOMO - take profits and wait for better opportunities';
    } else if (positiveRatio < 0.2) {
      return 'Look for DCA opportunities - be greedy when others are fearful';
    } else {
      return 'Stay disciplined - stick to your long-term strategy';
    }
  }
}

export { MCPTradingSimulator }; 
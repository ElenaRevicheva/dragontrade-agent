// 📊 ALGOM POST TRACKING WEB DASHBOARD
// Beautiful web interface to view posting statistics

import express from 'express';
import { createClient } from './db-config.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Dashboard HTML
app.get('/', async (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ALGOM Post Tracking Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .header h1 {
            color: #667eea;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1.1rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card h3 {
            color: #667eea;
            font-size: 0.9rem;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        
        .stat-card .value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .stat-card .label {
            color: #999;
            font-size: 0.9rem;
        }
        
        .section {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.8rem;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        th {
            background: #f8f9fa;
            color: #667eea;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 1px;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .badge-bybit {
            background: #e6d5f5;
            color: #764ba2;
        }
        
        .badge-binance {
            background: #fff5cc;
            color: #f0b90b;
        }
        
        .badge-both {
            background: #d4f4dd;
            color: #0ca750;
        }
        
        .badge-educational {
            background: #dae8fc;
            color: #0066cc;
        }
        
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #f0f0f0;
            border-radius: 15px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            transition: width 1s ease;
        }
        
        .refresh-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        
        .refresh-btn:hover {
            transform: translateY(-2px);
        }
        
        .loading {
            text-align: center;
            padding: 50px;
            color: #667eea;
        }
        
        .emoji {
            font-size: 1.2em;
            margin-right: 5px;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ALGOM Post Tracking Dashboard</h1>
            <p>Real-time statistics from your paper trading bot</p>
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Data</button>
        </div>
        
        <div id="dashboard">
            <div class="loading">Loading dashboard...</div>
        </div>
    </div>
    
    <script>
        async function loadDashboard() {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                
                renderDashboard(data);
            } catch (error) {
                document.getElementById('dashboard').innerHTML = 
                    '<div class="section"><p style="color: red;">Error loading data. Make sure migration is run!</p></div>';
            }
        }
        
        function renderDashboard(data) {
            const html = \`
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Posts</h3>
                        <div class="value">\${data.summary.totalPosts}</div>
                        <div class="label">All time</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Paper Trading</h3>
                        <div class="value">\${data.summary.paperTradingPosts}</div>
                        <div class="label">\${data.summary.paperTradingPercent}% of total</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Educational</h3>
                        <div class="value">\${data.summary.educationalPosts}</div>
                        <div class="label">\${data.summary.educationalPercent}% of total</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Today's Posts</h3>
                        <div class="value">\${data.summary.todayPosts}</div>
                        <div class="label">Last 24 hours</div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>📈 Content Balance</h2>
                    <div style="margin: 20px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span><span class="emoji">📊</span> Paper Trading: \${data.summary.paperTradingPercent}%</span>
                            <span><span class="emoji">📚</span> Educational: \${data.summary.educationalPercent}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: \${data.summary.paperTradingPercent}%">
                                \${data.summary.paperTradingPercent}%
                            </div>
                        </div>
                        <p style="margin-top: 10px; color: #666;">
                            \${data.summary.paperTradingPercent >= 28 && data.summary.paperTradingPercent <= 32 
                                ? '✅ Perfect balance!' 
                                : '⚠️ Target: 30% trading / 70% education'}
                        </p>
                    </div>
                </div>
                
                <div class="section">
                    <h2>📅 Daily Statistics (Last 7 Days)</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Paper Trading</th>
                                <th>🟣 Bybit</th>
                                <th>🟡 Binance</th>
                                <th>⚖️ Both</th>
                                <th>📚 Educational</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${data.dailyStats.map(day => \`
                                <tr>
                                    <td>\${new Date(day.post_date).toLocaleDateString()}</td>
                                    <td><strong>\${day.total_posts}</strong></td>
                                    <td>\${day.paper_trading_posts}</td>
                                    <td>\${day.bybit_posts}</td>
                                    <td>\${day.binance_posts}</td>
                                    <td>\${day.comparison_posts}</td>
                                    <td>\${day.educational_posts}</td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="section">
                    <h2>🎯 Recent Paper Trading Posts</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Post #</th>
                                <th>Exchange</th>
                                <th>Preview</th>
                                <th>Posted</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${data.recentPaperTrading.map(post => {
                                const exchangeBadge = post.exchange === 'bybit' ? 'badge-bybit' : 
                                                     post.exchange === 'binance' ? 'badge-binance' : 'badge-both';
                                const exchangeText = post.exchange ? post.exchange.toUpperCase() : 'UNKNOWN';
                                return \`
                                    <tr>
                                        <td><strong>#\${post.post_number}</strong></td>
                                        <td><span class="badge \${exchangeBadge}">\${exchangeText}</span></td>
                                        <td>\${post.content_preview}...</td>
                                        <td>\${new Date(post.posted_at).toLocaleString()}</td>
                                    </tr>
                                \`;
                            }).join('')}
                        </tbody>
                    </table>
                    \${data.recentPaperTrading.length === 0 ? '<p style="text-align: center; color: #999; padding: 20px;">No paper trading posts yet. Tracking starts from next post!</p>' : ''}
                </div>
                
                <div class="section">
                    <h2>📊 Post Type Distribution</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Post Type</th>
                                <th>Count</th>
                                <th>Percentage</th>
                                <th>Last Posted</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${data.postTypeDistribution.map(type => \`
                                <tr>
                                    <td>\${formatTypeName(type.post_type)}</td>
                                    <td><strong>\${type.count}</strong></td>
                                    <td>
                                        <div class="progress-bar" style="height: 20px;">
                                            <div class="progress-fill" style="width: \${type.percentage}%; font-size: 0.8rem;">
                                                \${type.percentage}%
                                            </div>
                                        </div>
                                    </td>
                                    <td>\${new Date(type.last_posted).toLocaleString()}</td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>
            \`;
            
            document.getElementById('dashboard').innerHTML = html;
        }
        
        function formatTypeName(type) {
            const emoji = {
                'paper_trading_report': '📊',
                'educational_content': '📚',
                'risk_management_tip': '💡',
                'market_psychology_insight': '🧠',
                'scam_awareness': '🚫',
                'real_data_report': '📈',
                'real_sentiment_meter': '😊',
                'personalized_lesson': '🎓'
            };
            
            const name = type.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            return (emoji[type] || '📝') + ' ' + name;
        }
        
        loadDashboard();
        
        // Auto-refresh every 5 minutes
        setInterval(loadDashboard, 5 * 60 * 1000);
    </script>
</body>
</html>
  `);
});

// API endpoint for stats
app.get('/api/stats', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  const client = createClient();
  
  try {
    await client.connect();
    
    // Get summary stats
    const summaryResult = await client.query(`
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN post_type = 'paper_trading_report' THEN 1 END) as paper_trading_posts,
        COUNT(CASE WHEN post_type IN ('educational_content', 'risk_management_tip', 'market_psychology_insight', 'scam_awareness', 'personalized_lesson') THEN 1 END) as educational_posts,
        COUNT(CASE WHEN posted_at > NOW() - INTERVAL '24 hours' THEN 1 END) as today_posts
      FROM post_log
      WHERE success = TRUE
    `);
    
    const summary = summaryResult.rows[0];
    summary.paper_trading_percent = summary.total_posts > 0 
      ? Math.round((summary.paper_trading_posts / summary.total_posts) * 100) 
      : 0;
    summary.educational_percent = summary.total_posts > 0
      ? Math.round((summary.educational_posts / summary.total_posts) * 100)
      : 0;
    
    // Get daily stats
    const dailyResult = await client.query(`
      SELECT * FROM daily_post_stats
      ORDER BY post_date DESC
      LIMIT 7
    `);
    
    // Get post type distribution
    const distributionResult = await client.query(`
      SELECT * FROM post_type_distribution
      ORDER BY count DESC
    `);
    
    // Get recent paper trading posts
    const recentResult = await client.query(`
      SELECT 
        post_number,
        exchange,
        content_preview,
        posted_at
      FROM post_log
      WHERE post_type = 'paper_trading_report' AND success = TRUE
      ORDER BY posted_at DESC
      LIMIT 10
    `);
    
    await client.end();
    
    res.json({
      summary: {
        totalPosts: parseInt(summary.total_posts),
        paperTradingPosts: parseInt(summary.paper_trading_posts),
        educationalPosts: parseInt(summary.educational_posts),
        todayPosts: parseInt(summary.today_posts),
        paperTradingPercent: summary.paper_trading_percent,
        educationalPercent: summary.educational_percent
      },
      dailyStats: dailyResult.rows,
      postTypeDistribution: distributionResult.rows,
      recentPaperTrading: recentResult.rows
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════════════════════╗`);
  console.log(`║                                                                        ║`);
  console.log(`║              📊 ALGOM DASHBOARD SERVER RUNNING! 📊                     ║`);
  console.log(`║                                                                        ║`);
  console.log(`╚════════════════════════════════════════════════════════════════════════╝\n`);
  console.log(`🌐 Dashboard URL: http://localhost:${PORT}`);
  console.log(`📊 API Endpoint: http://localhost:${PORT}/api/stats`);
  console.log(`\n✅ Ready to serve post tracking data!\n`);
});

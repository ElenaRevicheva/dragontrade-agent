const {Client} = require('pg');
// Reads DATABASE_URL, exactly as db-config.js does for the running agent. On Oracle that
// variable is already set — it is what PM2 starts the app with — so this diagnostic
// behaves identically there, without a credential living in the file.
const c = new Client({
    connectionString: process.env.DATABASE_URL
});

c.connect()
    .then(() => c.query('SELECT COUNT(*) as cnt FROM trading_stats'))
    .then(r => {
        console.log('✅ DB Connection OK!');
        console.log('   trading_stats rows:', r.rows[0].cnt);
        return c.query('SELECT COUNT(*) as cnt FROM post_log');
    })
    .then(r => {
        console.log('   post_log rows:', r.rows[0].cnt);
        return c.end();
    })
    .catch(e => console.log('❌ Error:', e.message));

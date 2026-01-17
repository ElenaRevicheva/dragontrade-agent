const {Client} = require('pg');
const c = new Client({
    connectionString: 'postgresql://dragontrade:dragontrade_secure_2026@localhost:5432/dragontrade'
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

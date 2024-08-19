const mariadb = require("mariadb");

const pool = mariadb.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "your_user",
    password: process.env.DB_PASSWORD || "your_password",
    database: process.env.DB_NAME || "your_database",
    connectionLimit: 10,
});

async function query(sql, params) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sql, params);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); // release to pool
    }
}

module.exports = {
    query,
};

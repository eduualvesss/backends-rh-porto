// pool = mantém várias conexões abertas com o banco, reaproveita em vez de abrir/fechar toda hora
// evita gastar tempo com handshake de conexão a cada query
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL, // string vem do .env, nunca hardcoded
});

module.exports = pool;
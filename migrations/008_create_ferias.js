require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runMigration() {
  const sqlPath = path.join(__dirname, '008_create_ferias.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 008 aplicada: tabela ferias criada.');
  } catch (err) {
    console.error('Erro ao rodar a migration 008:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
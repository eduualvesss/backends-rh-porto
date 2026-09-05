require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runMigration() {
  const sqlPath = path.join(__dirname, '007_create_centro_custo.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 007 aplicada: tabelas centros_custo e centro_custo_historico criadas.');
  } catch (err) {
    console.error('Erro ao rodar a migration 007:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
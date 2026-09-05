require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runMigration() {
  const sqlPath = path.join(__dirname, '006_create_documentos.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 006 aplicada: tabela documentos criada.');
  } catch (err) {
    console.error('Erro ao rodar a migration 006:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
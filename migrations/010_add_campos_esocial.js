require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runMigration() {
  const sqlPath = path.join(__dirname, '010_add_campos_esocial.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 010 aplicada: campos de matricula, FGTS e eSocial adicionados.');
  } catch (err) {
    console.error('Erro ao rodar a migration 010:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
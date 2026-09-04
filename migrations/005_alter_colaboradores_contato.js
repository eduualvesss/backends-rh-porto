require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runMigration() {
  const sqlPath = path.join(__dirname, '005_alter_colaboradores_contato.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 005 aplicada: colunas email, telefone, cargo e departamento adicionadas.');
  } catch (err) {
    console.error('Erro ao rodar a migration 005:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

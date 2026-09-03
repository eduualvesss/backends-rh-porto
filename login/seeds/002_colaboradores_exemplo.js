require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runSeed() {
  const sqlPath = path.join(__dirname, '002_colaboradores_exemplo.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Seed aplicado: 10 colaboradores inseridos (com email/telefone/cargo/departamento).');
  } catch (err) {
    console.error('Erro ao rodar o seed 002:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();

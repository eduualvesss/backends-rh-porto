// script standalone — roda uma vez, manual, fora do fluxo do server.js
// por isso precisa carregar o .env aqui: config/db.js não faz isso sozinho
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const sql = fs.readFileSync(path.join(__dirname, '002_add_role_to_users.sql'), 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Migration aplicada com sucesso');
  })
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    pool.end();
  });

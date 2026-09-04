// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

async function findByEmail(email) {
  // $1 é placeholder — pg escapa o valor sozinho, evita SQL injection
  // NUNCA concatenar email direto na string da query
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0]; // undefined se não achou ninguém
}

async function findById(id) {
  // não seleciono a coluna password aqui de propósito
  // dado sensível não sai do banco sem necessidade
  const result = await pool.query(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function createUser(email, hashedPassword) {
  // RETURNING evita ter que fazer um SELECT depois do INSERT
  // banco já devolve o que acabou de criar
  const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
    [email, hashedPassword]
  );
  return result.rows[0];
}

module.exports = { findByEmail, findById, createUser };
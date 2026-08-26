// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

async function createLog({ userId, action, resource, resourceId, beforeData, afterData, ipAddress }) {
  // JSONB espera string JSON — se não vier objeto, grava NULL em vez de "undefined"
  const before = beforeData !== undefined ? JSON.stringify(beforeData) : null;
  const after = afterData !== undefined ? JSON.stringify(afterData) : null;

  // $1, $2... são placeholders — pg escapa o valor sozinho, evita SQL injection
  // NUNCA concatenar valor direto na string da query
  const result = await pool.query(
    `INSERT INTO audit_logs (user_id, action, resource, resource_id, before_data, after_data, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, action, resource, resourceId, before, after, ipAddress]
  );
  return result.rows[0];
}

async function findAll({ page = 1, limit = 20, userId, action } = {}) {
  // page/limit podem vir como string (query params) — converte pra Number antes de calcular
  // limit é travado em 100 pra evitar que alguém peça a tabela inteira de uma vez
  // page nunca deixa o offset ficar negativo
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const offset = (safePage - 1) * safeLimit;

  // WHERE é montado dinamicamente, mas só com nomes de coluna fixos —
  // os valores sempre entram via placeholder, nunca concatenados na string
  const conditions = [];
  const params = [];

  if (userId !== undefined) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }

  if (action !== undefined) {
    params.push(action);
    conditions.push(`action = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(safeLimit);
  const limitIndex = params.length;
  params.push(offset);
  const offsetIndex = params.length;

  const result = await pool.query(
    `SELECT * FROM audit_logs
     ${where}
     ORDER BY created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params
  );
  return result.rows;
}

module.exports = { createLog, findAll };

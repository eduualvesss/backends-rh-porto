// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

async function createColaborador({ nome, email, cpf, telefone, cargo, departamento, dataAdmissao, status }) {
  // $1, $2... são placeholders — pg escapa o valor sozinho, evita SQL injection
  // NUNCA concatenar valor direto na string da query
  const result = await pool.query(
    `INSERT INTO colaboradores (nome, email, cpf, telefone, cargo, departamento, data_admissao, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [nome, email, cpf, telefone || null, cargo, departamento, dataAdmissao, status || 'ativo']
  );
  return result.rows[0];
}

async function findAll({ page = 1, limit = 20, departamento, status } = {}) {
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

  if (departamento !== undefined) {
    params.push(departamento);
    conditions.push(`departamento = $${params.length}`);
  }

  if (status !== undefined) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(safeLimit);
  const limitIndex = params.length;
  params.push(offset);
  const offsetIndex = params.length;

  const result = await pool.query(
    `SELECT * FROM colaboradores
     ${where}
     ORDER BY created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM colaboradores WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM colaboradores WHERE email = $1', [email]);
  return result.rows[0];
}

async function findByCpf(cpf) {
  const result = await pool.query('SELECT * FROM colaboradores WHERE cpf = $1', [cpf]);
  return result.rows[0];
}

async function updateColaborador(id, fields) {
  // lista trava quais colunas podem ser tocadas — chave nunca vem direto do body pro SQL
  const allowed = ['nome', 'email', 'cpf', 'telefone', 'cargo', 'departamento', 'data_admissao', 'status'];
  const sets = [];
  const params = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }

  if (sets.length === 0) return null; // nada pra atualizar, controller decide o que fazer

  sets.push('updated_at = NOW()');
  params.push(id);

  const result = await pool.query(
    `UPDATE colaboradores SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function deleteColaborador(id) {
  const result = await pool.query('DELETE FROM colaboradores WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = {
  createColaborador,
  findAll,
  findById,
  findByEmail,
  findByCpf,
  updateColaborador,
  deleteColaborador,
};

// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

async function create(colaboradorId, dataInicio, dataFim, dias, cid) {
  const result = await pool.query(
    `INSERT INTO atestados (colaborador_id, data_inicio, data_fim, dias, cid)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [colaboradorId, dataInicio, dataFim, dias, cid || null]
  );
  return result.rows[0];
}

async function findByColaborador(colaboradorId) {
  const result = await pool.query(
    `SELECT * FROM atestados
     WHERE colaborador_id = $1
     ORDER BY data_fim DESC, id DESC`,
    [colaboradorId]
  );
  return result.rows;
}

// regra do INSS: atestados cujo data_fim caia nos últimos 60 dias contados a partir de
// dataFimReferencia contam como um período contínuo, mesmo fracionados/intercalados —
// soma direto no banco (data - inteiro = data, não precisa de INTERVAL)
async function somaJanela60Dias(colaboradorId, dataFimReferencia) {
  const result = await pool.query(
    `SELECT COALESCE(SUM(dias), 0)::int AS soma
     FROM atestados
     WHERE colaborador_id = $1
       AND data_fim >= ($2::date - 60)
       AND data_fim <= $2::date`,
    [colaboradorId, dataFimReferencia]
  );
  return result.rows[0].soma;
}

module.exports = { create, findByColaborador, somaJanela60Dias };

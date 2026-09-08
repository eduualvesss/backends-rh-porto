// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

async function findByColaborador(colaboradorId) {
  const result = await pool.query(
    `SELECT id, colaborador_id, periodo_aquisitivo_inicio, periodo_aquisitivo_fim,
            data_inicio_gozo, data_fim_gozo, dias_gozados, dias_vendidos
     FROM ferias
     WHERE colaborador_id = $1
     ORDER BY periodo_aquisitivo_inicio`,
    [colaboradorId]
  );
  return result.rows;
}

module.exports = { findByColaborador };

// aqui fica só a parte que conversa com o banco
// controller não sabe SQL, só chama essas funções — separação de responsabilidade
const pool = require('../config/db');

async function findAll() {
  const result = await pool.query('SELECT id, nome, codigo FROM centros_custo ORDER BY nome');
  return result.rows;
}

async function findById(id) {
  const result = await pool.query('SELECT id, nome, codigo FROM centros_custo WHERE id = $1', [id]);
  return result.rows[0];
}

async function findHistoricoPorCentroCusto(centroCustoId, dataInicio, dataFim) {
  const temFiltroPeriodo = dataInicio !== undefined && dataFim !== undefined;

  const params = [centroCustoId];
  let condicaoPeriodo = '';

  if (temFiltroPeriodo) {
    // sobreposição de período: o histórico começou antes do fim pedido E
    // (ainda está em andamento [data_fim NULL] OU terminou depois do início pedido)
    params.push(dataFim, dataInicio);
    condicaoPeriodo = 'AND h.data_inicio <= $2 AND (h.data_fim IS NULL OR h.data_fim >= $3)';
  }

  const result = await pool.query(
    `SELECT h.id, h.colaborador_id, c.nome AS colaborador_nome, c.cargo,
            h.data_inicio, h.data_fim
     FROM centro_custo_historico h
     JOIN colaboradores c ON c.id = h.colaborador_id
     WHERE h.centro_custo_id = $1
     ${condicaoPeriodo}
     ORDER BY h.data_inicio DESC`,
    params
  );
  return result.rows;
}

async function findHistoricoPorColaborador(colaboradorId) {
  const result = await pool.query(
    `SELECT h.id, h.centro_custo_id, cc.nome AS centro_custo_nome, cc.codigo AS centro_custo_codigo,
            h.data_inicio, h.data_fim
     FROM centro_custo_historico h
     JOIN centros_custo cc ON cc.id = h.centro_custo_id
     WHERE h.colaborador_id = $1
     ORDER BY h.data_inicio DESC`,
    [colaboradorId]
  );
  return result.rows;
}

module.exports = {
  findAll,
  findById,
  findHistoricoPorCentroCusto,
  findHistoricoPorColaborador,
};

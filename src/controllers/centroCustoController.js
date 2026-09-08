// lógica de negócio fica toda aqui
// cada função = uma ação que o front pode disparar
const CentroCusto = require('../models/CentroCusto');
const Colaborador = require('../models/Colaborador');

async function listarCentrosCusto(req, res) {
  try {
    const centrosCusto = await CentroCusto.findAll();
    return res.json(centrosCusto);
  } catch (err) {
    console.error('Erro ao listar centros de custo:', err);
    return res.status(500).json({ error: 'erro ao listar centros de custo' });
  }
}

async function consultarPorCentroCusto(req, res) {
  const { centroCustoId } = req.params;
  if (!/^\d+$/.test(centroCustoId)) {
    return res.status(400).json({ error: 'id do centro de custo inválido' });
  }

  const { data_inicio: dataInicio, data_fim: dataFim } = req.query;
  // ou os dois períodos vêm juntos, ou nenhum — só um dos dois não dá pra montar a sobreposição
  if ((dataInicio !== undefined) !== (dataFim !== undefined)) {
    return res.status(400).json({ error: 'informe data_inicio e data_fim juntos, ou nenhum dos dois' });
  }

  try {
    const centroCusto = await CentroCusto.findById(centroCustoId);
    if (!centroCusto) return res.status(404).json({ error: 'centro de custo não encontrado' });

    const historico = await CentroCusto.findHistoricoPorCentroCusto(centroCustoId, dataInicio, dataFim);
    return res.json({ centro_custo: centroCusto, historico });
  } catch (err) {
    console.error('Erro ao consultar histórico por centro de custo:', err);
    return res.status(500).json({ error: 'erro ao consultar histórico por centro de custo' });
  }
}

async function consultarPorColaborador(req, res) {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  try {
    const colaborador = await Colaborador.findById(id);
    if (!colaborador) return res.status(404).json({ error: 'colaborador não encontrado' });

    const historico = await CentroCusto.findHistoricoPorColaborador(id);
    return res.json({ colaborador_id: Number(id), historico });
  } catch (err) {
    console.error('Erro ao consultar histórico de centro de custo do colaborador:', err);
    return res.status(500).json({ error: 'erro ao consultar histórico de centro de custo' });
  }
}

module.exports = { listarCentrosCusto, consultarPorCentroCusto, consultarPorColaborador };
